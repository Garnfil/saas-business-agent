import {MCPServerStreamableHttp} from "@openai/agents";

export const googleSheetsMCP = new MCPServerStreamableHttp({
    url: "https://google-sheet-mcp.vercel.app/mcp",
    name: "sheets-mcp-server",
});
