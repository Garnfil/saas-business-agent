import {tool} from "@openai/agents";
import {z} from "zod";

export const getCurrentDateTime = tool({
    name: "getCurrentDateTime",
    description:
        "Returns the current date and time in Asia/Manila timezone in a human-readable format.",
    parameters: z.object({}),
    execute: async () => {
        const now = new Date();

        const options: Intl.DateTimeFormatOptions = {
            timeZone: "Asia/Manila",
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZoneName: "short",
        };

        return now.toLocaleString("en-PH", options);
    },
});
