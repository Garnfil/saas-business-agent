import { tool } from "@openai/agents";
import { z } from "zod";
import { encryptToken } from "@/lib/crypto";

/**
 * get_encrypted_token
 * Returns an AES-256-GCM encrypted bundle of the appAuthToken from RunContext.
 * The bundle includes: enc (base64), iv (base64), tag (base64).
 * This can be safely passed to MCP tools, which can decrypt server-side
 * (assuming the same TOKEN_ENC_KEY is available in that environment).
 */
export const getEncryptedToken = tool({
  name: "get_encrypted_token",
  description:
    "Return an encrypted bundle of the current appAuthToken for secure transmission to MCP tools.",
  parameters: z.object({}),
  async execute(_params, runtime) {
    const ctx = (runtime as any)?.context as { appAuthToken?: string; tenantId?: string } | undefined;
    const token = ctx?.appAuthToken;

    if (!token) {
      return { hasAppAuthToken: false };
    }

    try {
      const { enc, iv, tag } = encryptToken(token);
      return {
        hasAppAuthToken: true,
        encryptedToken: { enc, iv, tag },
        note: "Use this encrypted bundle with your MCP tool and decrypt with the shared TOKEN_ENC_KEY.",
      };
    } catch (e) {
      return {
        error: true,
        message: (e as Error).message,
      };
    }
  },
});
