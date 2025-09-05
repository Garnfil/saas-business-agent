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

    const agent = new Agent({
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

    let agentStream = await run(agent, thread, {
        context: {
            appAuthToken,
            tenantId: userTenantId,
        },
        stream: true,
    });

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
