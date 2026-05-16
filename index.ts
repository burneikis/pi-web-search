import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { webSearch } from "./fetch.js";

export default function (pi: ExtensionAPI) {
  pi.registerTool({
    name: "web_search",
    label: "Web Search",
    description:
      "Search the internet for current information. Uses Anthropic's native web search via claude-haiku-4-5. Returns a concise summary with source URLs. Use when you need up-to-date facts, documentation, news, or anything not in your training data.",
    promptSnippet:
      "Search the internet for current information using Anthropic's web search",
    promptGuidelines: [
      "Use web_search when you need up-to-date information not in your training data.",
      "Be specific and concise with search queries for best results.",
      "web_search is not for viewing/fetching specific web pages. Use curl instead.",
    ],
    parameters: Type.Object({
      query: Type.String({
        description:
          "The search query. Be specific and concise for best results.",
      }),
    }),

    async execute(_toolCallId, params, signal, onUpdate, ctx) {
      const apiKey = await ctx.modelRegistry.getApiKeyForProvider("anthropic");
      if (!apiKey) {
        throw new Error(
          "No Anthropic API key found. Ensure your Anthropic API key is configured in pi.",
        );
      }

      onUpdate?.({
        content: [{ type: "text", text: `Searching: ${params.query}` }],
      });

      try {
        const result = await webSearch(params.query, apiKey);
        return {
          content: [{ type: "text", text: result }],
          details: { query: params.query },
        };
      } catch (error: any) {
        throw new Error(`Web search failed: ${error.message}`);
      }
    },
  });
}
