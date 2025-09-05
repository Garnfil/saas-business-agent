import { tool } from "@openai/agents";
import { z } from "zod";

/**
 * get_context: Safely exposes non-sensitive session context to the model on-demand.
 * - tenantId: full value
 * - hasAppAuthToken: boolean (does not expose the token)
 */
export const getContext = tool({
  name: "get_context",
  description:
    "Return safe session context values for this run (tenantId and whether an appAuthToken is present). Never returns secrets.",
  parameters: z.object({}),
  async execute(_params, runtime) {
    // Access context from runtime in a type-safe way
    const ctx = (runtime as any)?.context as { tenantId?: string; appAuthToken?: string } | undefined;
    const tenantId = ctx?.tenantId;
    const appAuthToken = ctx?.appAuthToken;

    return {
      tenantId: tenantId ?? null,
      hasAppAuthToken: Boolean(appAuthToken),
      note:
        "This tool never returns the appAuthToken. Use get_encrypted_token to obtain an encrypted bundle for secure transmission.",
    };
  },
});
