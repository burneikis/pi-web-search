import Anthropic from "@anthropic-ai/sdk";

const FAST = { model: "claude-haiku-4-5", maxTokens: 1024 };
const DEEP = { model: "claude-sonnet-5-5", maxTokens: 2048 };
const MAX_SEARCHES = 5;

const CLAUDE_CODE_IDENTITY =
  "You are Claude Code, Anthropic's official CLI for Claude.";

const SYSTEM_PROMPT =
  "You are a web search tool used by an AI coding agent. The agent reads your answer, " +
  "then fetches the best URLs with curl to read them in full. Your main job is to find " +
  "and rank the right URLs, not to write a long summary.";

function buildUserPrompt(query: string): string {
  return `Search the web for: ${query}

Output format:
<one to three sentence direct answer, only if the results clearly give one>

Sources:
- <url> - <what the page contains, max 15 words>

Rules:
- List the 3-8 most useful URLs, best first.
- Only use URLs that appear in the search results. Never guess or build URLs.
- Prefer primary sources: official docs, man pages, specs, changelogs, release notes, repos, then reputable secondary sources.
- Prefer the specific deep page over a home page or index.
- Prefer static readable pages. Avoid video, social media, login walls and JS-only apps.
- If results conflict or look outdated, say so in one line.
- No preamble, no filler, no markdown headings.`;
}

function isOAuthToken(apiKey: string): boolean {
  return apiKey.includes("sk-ant-oat");
}

function createClient(apiKey: string): Anthropic {
  if (!isOAuthToken(apiKey)) return new Anthropic({ apiKey });
  return new Anthropic({
    apiKey: null as unknown as string,
    authToken: apiKey,
    defaultHeaders: {
      "anthropic-beta": "claude-code-20250219,oauth-2025-04-20",
    },
  });
}

function extractAnswer(content: Anthropic.ContentBlock[]): string {
  return content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();
}

function extractSearchResults(
  content: Anthropic.ContentBlock[],
): Anthropic.WebSearchResultBlock[] {
  return content.flatMap((block) =>
    block.type === "web_search_tool_result" && Array.isArray(block.content)
      ? block.content
      : [],
  );
}

function formatMoreResults(
  answer: string,
  results: Anthropic.WebSearchResultBlock[],
): string {
  const seen = new Set<string>();
  const lines = results
    .filter((result) => {
      const url = result.url.replace(/\/$/, "");
      if (seen.has(url) || answer.includes(url)) return false;
      seen.add(url);
      return true;
    })
    .map((result) => `- ${result.url} - ${result.title}`);
  return lines.length ? `More results:\n${lines.join("\n")}` : "";
}

export async function webSearch(
  query: string,
  apiKey: string,
  deep = false,
): Promise<string> {
  const { model, maxTokens } = deep ? DEEP : FAST;
  const response = await createClient(apiKey).messages.create({
    model,
    max_tokens: maxTokens,
    system: [
      { type: "text", text: CLAUDE_CODE_IDENTITY },
      { type: "text", text: SYSTEM_PROMPT },
    ],
    tools: [
      {
        type: "web_search_20250305",
        name: "web_search",
        max_uses: MAX_SEARCHES,
      },
    ],
    messages: [{ role: "user", content: buildUserPrompt(query) }],
  });

  const answer = extractAnswer(response.content);
  const more = formatMoreResults(answer, extractSearchResults(response.content));
  return [answer, more].filter(Boolean).join("\n\n") || "No results found.";
}
