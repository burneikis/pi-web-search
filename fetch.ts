import Anthropic from "@anthropic-ai/sdk";

function isOAuthToken(apiKey: string): boolean {
  return apiKey.includes("sk-ant-oat");
}

export async function webSearch(
  query: string,
  apiKey: string
): Promise<string> {
  const client = isOAuthToken(apiKey)
    ? new Anthropic({
        apiKey: null as unknown as string,
        authToken: apiKey,
        defaultHeaders: {
          "anthropic-beta": "claude-code-20250219,oauth-2025-04-20",
        },
      })
    : new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    tools: [
      {
        type: "web_search_20250305",
        name: "web_search",
        max_uses: 5,
      },
    ],
    messages: [
      {
        role: "user",
        content: `Search the web for: ${query}\n\nProvide a concise summary of the most relevant results with source URLs.`,
      },
    ],
  });

  const textBlocks = response.content.filter(
    (block): block is Anthropic.TextBlock => block.type === "text"
  );

  return textBlocks.map((b) => b.text).join("\n\n") || "No results found.";
}
