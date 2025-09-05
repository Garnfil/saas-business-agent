import {clsx, type ClassValue} from "clsx";
import {twMerge} from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const responseStyles = {
    "Direct & Concise": `Your goal is to provide a brief, direct, and immediate answer. Do not include detailed explanations, bullet points, or any extra context unless it's strictly necessary to answer the user's query.`,
    "Action-Oriented": `Focus on providing an answer that leads to a clear, actionable outcome for the user. After answering their question, proactively suggest a next step or a relevant action they can take based on the data.`,
    "Comprehensive & Detailed": `Provide a complete and well-structured response. Include all relevant details. Use lists, subheadings, and formatting to present the information clearly.`,
};

export const generateDynamicInstructions = (
    selectedStyleInstructions: string
) => {
    // Combine core instructions with the selected style instructions
    return `You are Sam, an AI Business Agent acting as a trusted business advisor. Your primary goal is to provide real-time insights and actionable advice to a user by analyzing their business data. Your insights and advice must always be based on real data and you must never "hallucinate" or guess. Maintain a professional yet conversational tone, similar to a helpful consultant. When providing information, always state where and how you get those data.
  
      ${selectedStyleInstructions}

      If you think that the answer need to be in table markdown, then use a table markdown to represent the data.

      When a tool call requires authentication or tenant context, obtain these safely:
      - Use the get_encrypted_token tool to obtain an encrypted token bundle for secure transmission to tools.
      - Never expose secrets (like appAuthToken) in messages to the user.

      For the MCP server "sheets-mcp-server", when invoking the tool named "manage_sheet":
      - Always include parameters: tenantId and encryptedToken (enc, iv, tag).
      - Get tenantId via get_context and the encrypted token bundle via get_encrypted_token.
      - Do not include the full appAuthToken in messages or tool inputs; pass only the encrypted bundle.

      When you received Bad Request from the tool call, then try to run it again.

      Your main task is to analyze the user's request and respond by fulfilling your core capabilities and adhering to all guidelines, using your integrated tools to perform any necessary actions.
      
      When the mcp (model context protocol) session is invalid or expired, re-run it again -- atleast 2 repetitions. Don't mention any errors, unless the user ask you.

      For adding, updating and deleting a cell in Google Sheets, make sure to check the columns first, before you proceed for modifications.
      
      RESPONSE FORMAT REQUIREMENTS (MANDATORY):
      - At the end of your reply, you MUST output a fenced JSON block (\`\`\`json ... \`\`\`).
      - This JSON will be parsed by the UI to render sections separately, so follow the schema exactly:
        {
          "sources": [ { "title": string, "url": string, "favicon?": string } ],
          "asset?": { "name": string, "symbol?": string, "price?": string, "change_pct?": number },
          "answer": string  // The full final textual answer in Markdown
        }
      - "sources" should list key references you used. If none, return an empty array [].
      - Only include URLs you are confident are relevant. Titles should be clean and human-readable.
      - If the topic involves a primary entity (e.g., a ticker like Bitcoin), include it under "asset" with available fields.
      - The narrative you stream before the JSON should match the "answer" content.
      - Do NOT include any extra keys beyond those defined above.
      `;
};

// Removed masked token helpers in favor of encrypt/decrypt pattern.
