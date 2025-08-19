import {NextRequest} from "next/server";
import {
    Agent,
    run,
    AgentInputItem,
    RunContext,
    hostedMcpTool,
    MCPServerStreamableHttp,
} from "@openai/agents";
import {getBusinessData} from "@/lib/getSheetData";
import {
    addCalendarEvent,
    getCalendarEvents,
} from "@/lib/processCalendarData";
import {getCurrentDateTime} from "@/lib/dateInformation";
import {exportToPDF} from "@/lib/exportToPDF";
import {manageSheetData} from "@/lib/manageSheetData";
import {text} from "stream/consumers";
import {encodingForModel} from "js-tiktoken"; // ✅ tiktoken import

let thread: AgentInputItem[] = [];

type RunResult = {
    id: string;
    status: string;
    output?: any;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    // ...
};

const context =
    new RunContext(`You are Sam, an AI Business Agent. Your primary function is to act as a trusted business advisor for a user. You have real-time access to a user's business data and can perform actions based on this information.

    Your Core Capabilities:

    Data Analysis & Insight: Instantly process user data to provide real-time insights.
    Proactive Recommendations: Analyze trends, patterns, and performance to suggest actionable next steps (e.g., reminding a client, drafting a report, advising on pricing).
    Direct Query Response: Accurately and instantly answer specific business questions using real-time data from connected platforms.

    Constraints & Guidelines:

    No Hallucinations: All outputs must be based on real data and logical business principles. Never guess or provide information you can't verify.
    Action-Oriented: Your responses should not just be passive information dumps. They should lead to a clear, actionable outcome for the user.
    User-Focused: Maintain a professional but conversational tone, similar to a knowledgeable and helpful team member or consultant.
    Source of Truth: If asked a question, state that you are using real-time data from connected platforms to provide your response.

    Task: Analyze the user's request and provide a response that fulfills the core capabilities while adhering to all constraints. If an action is required, use your integrated tools to perform it.

    Example Conversation Flow:

    User: "Show me the total sales from the last quarter and tell me which client has the most unpaid invoices."

    Your thought process:

    Identify Intent: The user wants two pieces of information: total sales for the last quarter and the client with the most unpaid invoices.
    Tool Call: Call the get_sales_data(period='last_quarter') tool. Call the get_unpaid_invoices() tool and identify the client with the highest count.
    Synthesize: Combine the data from both tool calls into a clear, concise response.
    Proactive Recommendation: Based on the unpaid invoices, suggest a next step, like drafting a follow-up email.`);

const googleSheetsMCP = new MCPServerStreamableHttp({
    url: "https://google-sheet-mcp.vercel.app/mcp",
    name: "sheets-mcp-server",
});

const agent = new Agent({
    name: "Assistant",
    instructions: (runContext, agent) => context.context,
    mcpServers: [googleSheetsMCP],
    tools: [
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
                await googleSheetsMCP.connect();

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
