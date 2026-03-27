# Pi Web Search

My native claude web search tool for pi.

Uses claude's web search rather than an external provider. Uses claude haiku to run the search.

## Install

```bash
pi install npm:@burneikis/pi-web-search
```

## What it does

Registers a `web_search` tool the LLM can call to look up current information: documentation, news, packages, changelogs, anything not in its training data. The tool returns a concise summary with source URLs.

## Tool: `web_search`

| Parameter | Type | Description |
|---|---|---|
| `query` | `string` | The search query. Be specific and concise for best results. |

## Requirements

- An active Anthropic API key in your pi session (already needed to run pi with Claude)

