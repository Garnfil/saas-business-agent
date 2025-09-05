// lib/manageSheetData.ts
import {tool} from "@openai/agents";
import {z} from "zod";
import {GoogleSpreadsheet} from "google-spreadsheet";
import {JWT} from "google-auth-library";
import {googleSheets} from "./data/sheets";

const googlePrivateKey = process.env.GOOGLE_PRIVATE_KEY;
if (!googlePrivateKey) {
    throw new Error(
        "GOOGLE_PRIVATE_KEY environment variable is not set"
    );
}
const auth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: googlePrivateKey.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"], // full access
});

export const manageSheetData = tool({
    name: "manage_sheet_data",
    description:
        "Add, update, or delete rows/cells in a Google Sheet. Use business_sector_type to choose the correct sheet.",
    parameters: z.object({
        business_sector_type: z.enum([
            "invoices",
            "sales",
            "marketing",
            "clients",
            "tasks",
            "projects",
            "employees",
        ]),
        operation: z.enum(["add", "update", "delete"]),
        rowIndex: z
            .number()
            .nullable()
            .optional()
            .describe(
                "Row number (1-based index) for update/delete operations"
            ),
        newRow: z
            .record(z.string(), z.string())
            .nullable()
            .optional()
            .describe(
                "Object with column:value pairs for adding a row"
            ),
        cellUpdates: z
            .array(
                z.object({
                    column: z.string().describe("Column header name"),
                    value: z
                        .string()
                        .describe("New value for the cell"),
                })
            )
            .nullable()
            .optional(),
    }),

    async execute({
        business_sector_type,
        operation,
        rowIndex,
        newRow,
        cellUpdates,
    }) {
        console.log(
            "Google Service Account Email: ",
            process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
        );
        const matchedSheet = googleSheets.find(
            (s) => s.type === business_sector_type
        );
        if (!matchedSheet)
            throw new Error(
                `Unknown sheet type: ${business_sector_type}`
            );

        const doc = new GoogleSpreadsheet(matchedSheet.sheetId, auth);
        await doc.loadInfo();
        const sheet =
            doc.sheetsByTitle[business_sector_type] ??
            doc.sheetsByIndex[0];

        // Handle operations
        if (operation === "add") {
            if (!newRow)
                throw new Error(
                    "newRow is required for add operation"
                );
            await sheet.addRow(newRow);
            return {
                success: true,
                message: "Row added successfully",
                newRow,
            };
        }

        if (operation === "update") {
            if (!rowIndex || !cellUpdates) {
                throw new Error(
                    "rowIndex and cellUpdates are required for update"
                );
            }

            // 1) Make sure headers are loaded and we know the *real* header names
            await sheet.loadHeaderRow();
            const headers = sheet.headerValues ?? [];
            const resolveHeader = (name: string) => {
                // case-insensitive match to be user-friendly
                const i = headers.findIndex(
                    (h) =>
                        h.trim().toLowerCase() ===
                        name.trim().toLowerCase()
                );
                return i >= 0 ? headers[i] : null;
            };

            // 2) Pull the exact row (0-based array index)
            const rows = await sheet.getRows();
            const row = rows[rowIndex - 1];
            if (!row) throw new Error(`Row ${rowIndex} not found`);

            // 3) Apply updates using header-aware API
            for (const {column, value} of cellUpdates) {
                const header = resolveHeader(column);
                if (!header) {
                    throw new Error(
                        `Column "${column}" not found. Available headers: ${headers.join(
                            ", "
                        )}`
                    );
                }
                row.set(header, value); // <-- critical: use set(), not property assignment
            }

            await row.save();
            return {
                success: true,
                message: `Row ${rowIndex} updated`,
                updates: cellUpdates,
            };
        }

        if (operation === "delete") {
            if (!rowIndex)
                throw new Error("rowIndex is required for delete");
            const rows = await sheet.getRows();
            const row = rows[rowIndex - 1];
            if (!row) throw new Error(`Row ${rowIndex} not found`);
            await row.delete();
            return {
                success: true,
                message: `Row ${rowIndex} deleted`,
            };
        }

        return {success: false, message: "Invalid operation"};
    },
});
