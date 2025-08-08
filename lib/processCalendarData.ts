import {tool} from "@openai/agents";
import {google} from "googleapis";
import {z} from "zod";
import creds from "../config/avian-cable-456907-n4-9fbf5727fbcc.json";
import {JWT} from "google-auth-library";

const calendar = google.calendar("v3");

const auth = new JWT({
    email: creds.client_email,
    key: creds.private_key.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/calendar"],
});

export const addCalendarEvent = tool({
    name: "add_calendar_event",
    description:
        "Create a new Google Calendar event based on user input.",
    parameters: z.object({
        summary: z
            .string()
            .describe("Title or summary of the event."),
        description: z
            .string()
            .nullable()
            .optional()
            .describe("Details of the event."),
        startTime: z
            .string()
            .nullable()
            .default(new Date().toISOString())
            .describe(
                "Start time in ISO 8601 format, e.g., 2025-08-01T09:00:00+08:00"
            ),
        endTime: z
            .string()
            .nullable()
            .default(new Date().toISOString())
            .describe(
                "End time in ISO 8601 format, e.g., 2025-08-01T10:00:00+08:00"
            ),
        timeZone: z
            .string()
            .nullable()
            .optional()
            .default("Asia/Manila")
            .describe("Time zone for the event."),
    }),
    async execute({
        summary,
        description,
        startTime,
        endTime,
        timeZone,
    }) {
        try {
            const response = await calendar.events.insert({
                auth,
                calendarId: "jamesgarnfil15@gmail.com",
                requestBody: {
                    summary,
                    description,
                    start: {
                        dateTime:
                            startTime ?? new Date().toISOString(),
                        timeZone,
                    },
                    end: {
                        dateTime: endTime ?? new Date().toISOString(),
                        timeZone,
                    },
                },
            });

            return {
                success: true,
                eventLink: response.data.htmlLink,
                eventId: response.data.id,
            };
        } catch (error) {
            console.error("Calendar insert error:", error);
            return {
                error: true,
                message: (error as Error).message,
                details: JSON.stringify(error, null, 2),
            };
        }
    },
});

export const getCalendarEvents = tool({
    name: "get_calendar_events",
    description:
        "Fetch upcoming or time-bound events from Google Calendar.",
    parameters: z.object({}),
    async execute() {
        try {
            const res = await calendar.events.list({
                auth,
                calendarId: "jamesgarnfil15@gmail.com",
            });

            const events = res.data.items?.map((event) => ({
                id: event.id,
                summary: event.summary,
                description: event.description,
                start: event.start?.dateTime ?? event.start?.date,
                end: event.end?.dateTime ?? event.end?.date,
                link: event.htmlLink,
            }));

            console.log("Fetched calendar events:", events);

            return {
                count: events?.length ?? 0,
                events: events ?? [],
            };
        } catch (error) {
            return {
                error: true,
                message: (error as Error).message,
            };
        }
    },
});
