// api/run-agent/route.ts

import {NextRequest} from "next/server";
import {
    Agent,
    run,
    AgentInputItem,
    RunContext,
    RunItem,
} from "@openai/agents";
import {
    addCalendarEvent,
    getCalendarEvents,
} from "@/lib/processCalendarData";
import {getCurrentDateTime} from "@/lib/dateInformation";
import {googleSheetsMCP} from "@/lib/mcp-servers/servers";
import {
    generateDynamicInstructions,
    responseStyles,
} from "@/lib/utils";
import {
    MESSAGE_OUTPUT_ITEM,
    TOOL_CALL_ITEM,
    TOOL_CALL_OUTPUT_ITEM,
} from "@/lib/constant/event-item-type";

let thread: AgentInputItem[] = [];

export async function POST(req: NextRequest) {
    const {input, responseStyle} = await req.json();
    if (!input) return new Response("Missing input", {status: 400});

    const selectedStyleInstructions =
        responseStyles[
            responseStyle as keyof typeof responseStyles
        ] || responseStyles["Direct & Concise"]; // Default to Action-Oriented

    // Combine core instructions with the selected style instructions
    const dynamicInstructions = generateDynamicInstructions(
        selectedStyleInstructions
    );

    const dynamicContext = new RunContext(dynamicInstructions);

    const agent = new Agent({
        name: "Assistant",
        instructions: () => dynamicContext.context,
        mcpServers: [googleSheetsMCP],
        tools: [
            addCalendarEvent,
            getCalendarEvents,
            getCurrentDateTime,
        ],
        modelSettings: {toolChoice: "auto"},
    });

    thread.push({role: "user", content: input});

    await googleSheetsMCP.connect();

    const encoder = new TextEncoder();

    let agentStream = await run(agent, thread, {
        stream: true,
    });

    const stream = new ReadableStream({
        async start(controller) {
            try {
                while (true) {
                    // Stream incremental text to client
                    const textStream = agentStream.toTextStream({
                        compatibleWithNodeStreams: false,
                    });

                    for await (const chunk of textStream) {
                        controller.enqueue(encoder.encode(chunk));
                    }

                    await agentStream.completed;
                    thread = agentStream.history;

                    // Check for interruptions (human approval required)
                    if (agentStream.interruptions?.length) {
                        controller.enqueue(
                            encoder.encode(
                                "\n[INTERRUPTION] Approval required for tool calls\n"
                            )
                        );
                        break; // Optionally end the stream OR handle approval here
                    } else {
                        break; // No interruptions → exit loop
                    }
                }

                controller.close();
            } catch (err) {
                controller.error(err);
            } finally {
                googleSheetsMCP.close();
            }
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            "Transfer-Encoding": "chunked",
        },
    });
}

// for await (const event of agentStream) {
//                 if (event.type === "run_item_stream_event") {
//                     const item: RunItem = event.item;
//                     let messagePayload = null;

//                     if (item.type === TOOL_CALL_ITEM) {
//                         messagePayload = {
//                             type: "thought",
//                             message: "Calling a Tool...",
//                         };
//                     } else if (item.type === TOOL_CALL_OUTPUT_ITEM) {
//                         messagePayload = {
//                             type: "thought",
//                             message:
//                                 "Retrieving Result from the Tool...",
//                         };
//                     } else if (item.type === MESSAGE_OUTPUT_ITEM) {
//                         const contentItem = item.rawItem.content[0];
//                         let outputText = "";
//                         if (contentItem?.type === "output_text") {
//                             outputText = contentItem.text;
//                             console.log("Output Text: ", outputText);
//                         } else if (contentItem?.type === "refusal") {
//                             outputText = contentItem.refusal;
//                         }
//                         messagePayload = {
//                             type: "final",
//                             message: outputText,
//                         };
//                     }

//                     if (messagePayload) {
//                         controller.enqueue(
//                             encoder.encode(
//                                 `data: ${JSON.stringify(
//                                     messagePayload
//                                 )}\n\n`
//                             )
//                         );
//                     }
//                 }
//             }
