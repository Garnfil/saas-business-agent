"use server";

import {Agent, AgentInputItem, run} from "@openai/agents";
import {getBusinessData} from "../getSheetData";
import {
    addCalendarEvent,
    getCalendarEvents,
} from "../processCalendarData";
import {getCurrentDateTime} from "../dateInformation";

// Maintain conversation history
let thread: AgentInputItem[] = [];

const agent = new Agent({
    name: "Assistant",
    instructions: process.env.AGENT_INSTRUCTIONS,
    tools: [
        getBusinessData,
        addCalendarEvent,
        getCalendarEvents,
        getCurrentDateTime,
    ],
    modelSettings: {toolChoice: "auto"},
});

export async function runAgent(userInput: string) {
    // Add new user input to thread
    thread.push({role: "user", content: userInput});

    console.log("Running agent with thread:", thread);

    // Run the agent with current thread
    const result = await run(agent, thread);

    // Update the thread with full history (including AI and tool responses)
    thread = result.history;

    // Return just the final output text
    return result.finalOutput;
}
