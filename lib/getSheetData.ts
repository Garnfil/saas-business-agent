import {tool} from "@openai/agents";
import OpenAI from "openai";
import {z} from "zod";
import {GoogleSpreadsheet} from "google-spreadsheet";
import {JWT} from "google-auth-library";
import creds from "../config/avian-cable-456907-n4-09a10a17fdf4.json";
import {googleSheets} from "./data/sheets";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const getBusinessData = tool({
    name: "get_business_data",
    description:
        "Analyze user input to identify the relevant business data type and retrieve data from the appropriate spreadsheet. The tool supports five types of sheets: Invoices (containing billing details, payment status, and transaction records), Tasks (listing task assignments, deadlines, and progress), Projects (detailing project timelines, milestones, and resources), Clients (storing client contact information, preferences, and interaction history), and Employees (including employee details, roles, and performance metrics).",
    parameters: z.object({
        userInput: z
            .string()
            .describe("User query asking for some business data."),
        business_sector_type: z
            .enum([
                "invoices",
                "sales",
                "marketing",
                "clients",
                "tasks",
                "projects",
                "employees",
            ])
            .describe(
                "Business sectors to filter the data (e.g invoices, clients, marketing, sales, employees, projects, tasks)."
            ),
        maxRows: z
            .number()
            .nullable()
            .optional()
            .default(100)
            .describe("Max number of rows to return."),
    }),
    async execute({business_sector_type, maxRows}) {
        const matchedSheet = googleSheets.find(
            (s) => s.type === business_sector_type
        );

        const data = await fetchSheetData({
            spreadsheetId: matchedSheet?.sheetId ?? "",
            sheetTitle: business_sector_type, // optional
            maxRows: maxRows ?? 100, // default to 100 rows if not specified
        });

        return data;
    },
});

const auth = new JWT({
    email: creds.client_email,
    key: creds.private_key.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

type FetchOptions = {
    spreadsheetId: string;
    sheetTitle?: string;
    maxRows?: number;
};

const sheetCache = new Map<string, {timestamp: number; data: any}>();
const CACHE_TTL = 60 * 1000; // 1 minute

const fetchSheetData = async ({
    spreadsheetId,
    sheetTitle,
    maxRows,
}: FetchOptions) => {
    const cacheKey = `${spreadsheetId}:${sheetTitle}:${maxRows}`;
    const now = Date.now();

    if (sheetCache.has(cacheKey)) {
        const cached = sheetCache.get(cacheKey)!;
        if (now - cached.timestamp < CACHE_TTL) return cached.data;
    }

    const doc = new GoogleSpreadsheet(spreadsheetId, {
        apiKey: process.env.GOOGLE_API_KEY ?? "",
    });
    await doc.loadInfo();

    const sheet =
        sheetTitle && doc.sheetsByTitle[sheetTitle]
            ? doc.sheetsByTitle[sheetTitle]
            : doc.sheetsByIndex[0];

    await sheet.loadHeaderRow();
    const headers = sheet.headerValues;
    const rows = await sheet.getRows({limit: maxRows});

    const cleanRows = rows.map((row: any) => {
        const rowObj: Record<string, string> = {};
        headers.forEach((header) => {
            rowObj[header] = row.get(header) ?? "";
        });
        return rowObj;
    });

    const result = {
        sheetTitle: sheet.title,
        rowCount: cleanRows.length,
        headers,
        rows: cleanRows,
    };
    sheetCache.set(cacheKey, {timestamp: now, data: result});
    return result;
};
