// app/api/agent/stream/route.ts
import {NextRequest} from "next/server";
import {Agent, run, AgentInputItem} from "@openai/agents";
import {getBusinessData} from "@/lib/getSheetData";
import {
    addCalendarEvent,
    getCalendarEvents,
} from "@/lib/processCalendarData";
import {getCurrentDateTime} from "@/lib/dateInformation";
import {exportToPDF} from "@/lib/exportToPDF";

let thread: AgentInputItem[] = [];

const agent = new Agent({
    name: "Assistant",
    instructions:
        "You are Sam, a friendly Business AI Assistant and trusted advisor, helping users manage their business and make quick, confident decisions. Respond in a short, conversational tone, like a brief phone call, using clear, business-friendly language without technical jargon unless asked. Offer direct answers with actionable recommendations based on trends, suggesting practical steps like adjusting pricing, following up with clients, or optimizing operations. Use tools as needed. Avoid meta-commentary, irrelevant details, or repeating instructions. For export, just message the link, no other text.",
    tools: [
        getBusinessData,
        addCalendarEvent,
        getCalendarEvents,
        getCurrentDateTime,
        exportToPDF,
    ],
    modelSettings: {toolChoice: "auto"},
});

export async function POST(req: NextRequest) {
    const {input} = await req.json();
    if (!input) return new Response("Missing input", {status: 400});

    thread.push({role: "user", content: input});

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            try {
                let agentStream = await run(agent, thread, {
                    stream: true,
                });

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
