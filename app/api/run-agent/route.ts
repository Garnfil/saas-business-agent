// api/run-agent/route.ts

import {NextRequest} from "next/server";

import {Agent, run, AgentInputItem} from "@openai/agents";
import {
    addCalendarEvent,
    getCalendarEvents,
} from "@/lib/processCalendarData";
import {getCurrentDateTime} from "@/lib/dateInformation";
import {googleSheetsMCP} from "@/lib/mcp-servers/servers";
import {getContext} from "@/lib/agents/tools/getContext";
import {getEncryptedToken} from "@/lib/agents/tools/getEncryptedToken";

import {cookies} from "next/headers";
import {
    generateDynamicInstructions,
    responseStyles,
} from "../../../lib/utils";

let thread: AgentInputItem[] = [];

interface UserGoogleAuth {
    accessToken: string | null;
    refreshToken: string | null;
}

export async function POST(req: NextRequest) {
    const {input, responseStyle, userGoogleAuth, userTenantId} =
        await req.json();
    if (!input) return new Response("Missing input", {status: 400});

    const selectedStyleInstructions =
        responseStyles[
            responseStyle as keyof typeof responseStyles
        ] || responseStyles["Direct & Concise"]; // Default to Action-Oriented

    // Combine core instructions with the selected style instructions
    const dynamicInstructions = generateDynamicInstructions(
        selectedStyleInstructions
    );

    // Preferred model order; will automatically fall back on token/context errors
    const MODEL_CANDIDATES = [
        "gpt-4.1", // primary
        "gpt-4o", // strong multimodal, large context
        "gpt-4o-mini", // economical fallback with good context
    ] as const;

    const buildAgent = (model: string) =>
        new Agent({
            name: "Assistant",
            instructions: () => dynamicInstructions,
            mcpServers: [googleSheetsMCP],
            tools: [
                addCalendarEvent,
                getCalendarEvents,
                getCurrentDateTime,
                // Safe context exposure tool (tenantId and masked appAuthToken)
                getContext,
                // Secure encrypted token provider for MCP usage
                getEncryptedToken,
            ],
            // specify the model at the top-level per SDK typing
            model,
            modelSettings: {toolChoice: "auto"},
        });

    thread.push({role: "user", content: input});

    await googleSheetsMCP.connect();

    // no streaming encoder needed; we return JSON with final message
    const cookieStore = await cookies();
    const appAuthToken = cookieStore.get("session_token")?.value;

    // Surface only SAFE context to the model (never expose tokens)
    if (userTenantId) {
        // Provide tenantId as a system message so the assistant can answer questions about it
        thread.push({
            role: "system",
            content: `For this session, the user's current tenant ID is: ${userTenantId} & the appAuthToken is: ${appAuthToken}.`,
        });
    }

    const isTokenLimitError = (err: unknown) => {
        const msg = (err as any)?.message?.toString()?.toLowerCase() || "";
        const code = (err as any)?.code?.toString()?.toLowerCase() || "";
        // Heuristics for context/token limit errors from API/SDKs
        return (
            msg.includes("maximum context length") ||
            msg.includes("context_length_exceeded") ||
            msg.includes("too many tokens") ||
            msg.includes("request too large") ||
            msg.includes("reduce the length") ||
            msg.includes("token limit") ||
            code.includes("context_length_exceeded")
        );
    };

    const trimHistoryForRetry = (history: AgentInputItem[]): AgentInputItem[] => {
        // Keep the most recent 30 messages; preserve the earliest system message if present
        const systemMessages = (history as any[]).filter((m: any) => m?.role === "system");
        const nonSystem = (history as any[]).filter((m: any) => m?.role !== "system");
        const keptNonSystem = nonSystem.slice(-30);
        return (systemMessages as AgentInputItem[]).slice(0, 1).concat(keptNonSystem as AgentInputItem[]);
    };

    // Attempt running with fallbacks on token-limit errors
    let agentStream: any | null = null;
    let lastError: unknown = null;
    let workingThread: AgentInputItem[] = thread;
    let modelUsed: string | null = null;
    for (let i = 0; i < MODEL_CANDIDATES.length; i++) {
        const model = MODEL_CANDIDATES[i];
        const agent = buildAgent(model);
        try {
            agentStream = await run(agent, workingThread, {
                context: {
                    appAuthToken,
                    tenantId: userTenantId,
                },
                stream: true,
            });
            // success
            modelUsed = model;
            break;
        } catch (err) {
            lastError = err;
            // On the last model, try trimming history once and retry
            if (isTokenLimitError(err)) {
                // If we haven't tried trimming yet for this model, trim and retry once
                try {
                    const trimmed = trimHistoryForRetry(workingThread);
                    if (trimmed.length !== workingThread.length) {
                        workingThread = trimmed;
                        // retry with the same model after trimming
                        const retriedAgent = buildAgent(model);
                        agentStream = await run(retriedAgent, workingThread, {
                            context: {
                                appAuthToken,
                                tenantId: userTenantId,
                            },
                            stream: true,
                        });
                        modelUsed = model;
                        break;
                    }
                } catch (retryErr) {
                    lastError = retryErr;
                }
                // Otherwise continue to next candidate
                continue;
            } else {
                // Non token-limit error; do not continue rotating models
                break;
            }
        }
    }

    if (!agentStream) {
        // All attempts failed
        const message = (lastError as Error)?.message || "Agent run failed";
        return new Response(
            JSON.stringify({
                message: "",
                error: message,
            }),
            {
                status: 500,
                headers: {"Content-Type": "application/json"},
            }
        );
    }

    try {
        // Collect the full text internally and return once complete
        const textStream = agentStream.toTextStream({
            compatibleWithNodeStreams: false,
        });

        let finalText = "";
        for await (const chunk of textStream) {
            finalText += chunk;
        }

        await agentStream.completed;
        thread = agentStream.history;

        // If there were interruptions, you could surface that in JSON as well
        const hasInterruptions = Boolean(
            agentStream.interruptions?.length
        );

        return new Response(
            JSON.stringify({
                message: finalText,
                interrupted: hasInterruptions,
                modelUsed,
            }),
            {
                headers: {"Content-Type": "application/json"},
            }
        );
    } catch (err) {
        return new Response(
            JSON.stringify({
                message: "",
                error: (err as Error)?.message || "Agent run failed",
            }),
            {
                status: 500,
                headers: {"Content-Type": "application/json"},
            }
        );
    } finally {
        googleSheetsMCP.close();
    }
}
