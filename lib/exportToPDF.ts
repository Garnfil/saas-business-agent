import {PDFDocument, StandardFonts} from "pdf-lib";
import {z} from "zod";
import {tool} from "@openai/agents"; // assuming you use the same helper as getBusinessData

export const exportToPDF = tool({
    name: "export_to_pdf",
    description:
        "Generate a PDF from the provided content. Returns the filename, a base64-encoded PDF, a data: URI downloadLink, and a message. Content can be a string (supports newlines) or an array of strings.",
    parameters: z.object({
        content: z
            .union([z.string(), z.array(z.string())])
            .describe(
                "Text content or array of lines to include in the PDF."
            ),
        filename: z
            .string()
            .nullable()
            .optional()
            .describe(
                "Optional filename for the PDF (default: export.pdf)."
            ),
        maxLinesPerPage: z
            .number()
            .nullable()
            .optional()
            .describe(
                "Optional max number of text lines per page (default: 45)."
            ),
    }),
    async execute({
        content,
        filename = "export.pdf",
        maxLinesPerPage = 45,
    }) {
        try {
            const pdfDoc = await PDFDocument.create();
            const font = await pdfDoc.embedFont(
                StandardFonts.Helvetica
            );
            const fontSize = 11;
            const pageWidth = 595; // A4 width in points
            const pageHeight = 842; // A4 height in points
            const marginLeft = 50;
            const marginTop = 800;

            // Normalize content into an array of lines
            let lines: string[] = [];
            if (Array.isArray(content)) {
                lines = content.flatMap((s) =>
                    typeof s === "string"
                        ? s.split("\n")
                        : [String(s)]
                );
            } else {
                lines = content.split("\n");
            }

            // create pages and draw text
            let page = pdfDoc.addPage([pageWidth, pageHeight]);
            let y = marginTop;
            let lineCount = 0;

            for (const rawLine of lines) {
                const line = String(rawLine);

                // If line too long, wrap simple by characters (naive) to avoid overflow.
                // For more accurate wrapping use text-measurement logic or a helper lib.
                const approxCharsPerLine = 80; // adjust for fontSize/page width
                let remaining = line;
                while (remaining.length > 0) {
                    const chunk =
                        remaining.length > approxCharsPerLine
                            ? remaining.slice(0, approxCharsPerLine)
                            : remaining;
                    page.drawText(chunk, {
                        x: marginLeft,
                        y,
                        size: fontSize,
                        font,
                        maxWidth: pageWidth - marginLeft * 2,
                    });

                    remaining = remaining.slice(chunk.length);
                    y -= fontSize + 4;
                    lineCount++;

                    if (
                        lineCount >= (maxLinesPerPage ?? 45) ||
                        y < 50
                    ) {
                        page = pdfDoc.addPage([
                            pageWidth,
                            pageHeight,
                        ]);
                        y = marginTop;
                        lineCount = 0;
                    }
                }
            }

            const pdfBytes = await pdfDoc.save();
            const base64 = Buffer.from(pdfBytes).toString("base64");
            const downloadLink = `data:application/pdf;base64,${base64}`;
            return {
                error: false,
                filename,
                base64,
                downloadLink,
                message: "PDF successfully generated.",
            };
        } catch (err: any) {
            return {
                error: true,
                message: `Failed to generate PDF: ${
                    err?.message ?? String(err)
                }`,
            };
        }
    },
});
