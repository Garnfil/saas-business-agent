"use server";

import {GoogleSpreadsheet} from "google-spreadsheet";
import {JWT, GoogleAuth} from "google-auth-library";

export const fetchSheetData = async () => {
    try {
        const auth = new JWT({
            email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: process.env.GOOGLE_PRIVATE_KEY ?? "",
            scopes: [
                "https://www.googleapis.com/auth/spreadsheets.readonly",
            ],
        });

        const doc = new GoogleSpreadsheet(
            "1qm1qoKMvtyXoMyboSPAZmq3I9Xhw3fLiO-CijjfrE4A",
            {apiKey: process.env.GOOGLE_API_KEY ?? ""}
        );

        await doc.loadInfo();

        // ✅ Extract only serializable data
        const sheet = doc.sheetsByIndex[0]; // use the first sheet
        const rows = await sheet.getRows(); // get the rows

        // Assume headers are known after loading the sheet
        await sheet.loadHeaderRow(); // get headers
        const headers = sheet.headerValues;

        // Define a type for the row shape dynamically
        type SheetRow = {
            [K in (typeof headers)[number]]: string;
        };

        const cleanRows: SheetRow[] = rows.map((row: any) => {
            const rowObj = {} as SheetRow;
            headers.forEach((header: any) => {
                rowObj[header] = row.get(header); // Default to empty string if undefined
            });
            return rowObj;
        });

        return {
            sheetTitle: sheet.title,
            headers: sheet.headerValues,
            rowCount: cleanRows.length,
            rows: cleanRows,
        };
    } catch (error) {
        console.error(
            "Full error object:",
            JSON.stringify(error, null, 2)
        );
        return (error as Error).message;
    }
};
