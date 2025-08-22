// Import necessary modules from the Agents SDK and pdf-lib
import {tool} from "@openai/agents";
import {z} from "zod";
import {PDFDocument, StandardFonts, rgb} from "pdf-lib";

/**
 * Defines a function tool for an OpenAI Agent to export text content to a PDF.
 * This tool uses the 'pdf-lib' library to create and manipulate the PDF document.
 * The output is a base64-encoded string of the PDF file.
 */
export const exportToPdf = tool({
    name: "exportToPdf",
    description:
        "Exports provided text content to a PDF document with a given title. Returns the base64-encoded PDF data.",
    parameters: z.object({
        // The title of the PDF document. It will be displayed at the top.
        title: z.string().describe("The title of the PDF document."),
        // The main body of text to be included in the PDF.
        content: z
            .string()
            .describe("The text content to be written to the PDF."),
    }),
    execute: async ({title, content}) => {
        try {
            // Create a new PDF document.
            const pdfDoc = await PDFDocument.create();

            // Embed the Helvetica font from the standard fonts.
            const font = await pdfDoc.embedFont(
                StandardFonts.Helvetica
            );

            // Add a new page to the document.
            let page = pdfDoc.addPage();

            // Get the page dimensions for positioning content.
            const {width, height} = page.getSize();
            const margin = 50;

            // Draw the title text at the top of the page.
            page.drawText(title, {
                x: margin,
                y: height - margin,
                size: 24,
                font: font,
                color: rgb(0, 0, 0),
            });

            // Split the content into lines and draw them on the page.
            // This is a simple implementation. For more complex text wrapping,
            // you would need a more advanced function.
            const lines = content.split("\n");
            let yPosition = height - margin - 30;
            const fontSize = 12;
            const lineHeight = fontSize + 4;

            for (const line of lines) {
                if (yPosition < margin) {
                    // Add a new page if we run out of space.
                    page = pdfDoc.addPage();
                    yPosition = height - margin - 30;
                }
                page.drawText(line, {
                    x: margin,
                    y: yPosition,
                    size: fontSize,
                    font: font,
                    color: rgb(0, 0, 0),
                });
                yPosition -= lineHeight;
            }

            // Serialize the PDF document to a Uint8Array.
            const pdfBytes = await pdfDoc.save();

            // Convert the byte array to a base64 string and return it.
            // This is a common way to pass binary data as a string in APIs.
            const base64Pdf =
                Buffer.from(pdfBytes).toString("base64");
            return base64Pdf;
        } catch (error: any) {
            console.error("Error generating PDF:", error);
            return `Failed to generate PDF. Error: ${error?.message}`;
        }
    },
});
