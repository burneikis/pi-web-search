# Pi Web Search

My native claude web search tool for pi.

Uses claude's web search rather than an external provider. Uses claude haiku to run the search, or claude sonnet 5.5 in deep mode.

## Install

```bash
pi install npm:@burneikis/pi-web-search
```

## What it does

Registers a `web_search` tool the LLM can call to look up current information: documentation, news, packages, changelogs, anything not in its training data. The tool returns:

- a short direct answer (when the results give one)
- a ranked list of source URLs, primary sources first, each with a one-line description
- a "More results" list with the other URLs the search returned

The output is built for an agent that fetches the best URLs with curl to read them in full.

## Tool: `web_search`

| Parameter | Type | Description |
|---|---|---|
| `query` | `string` | The search query. Be specific and concise for best results. |
| `deep` | `boolean` (optional) | Use `claude-sonnet-5-5` instead of `claude-haiku-4-5`. Better source ranking and synthesis for hard research questions, at about 2x cost per call. Default `false`. |

## Requirements

- An active Anthropic API key in your pi session (already needed to run pi with Claude)

