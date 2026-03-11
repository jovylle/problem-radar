# AI Opportunity Radar

An automated radar that scans Reddit for pain-point posts and sends you startup ideas via Telegram.

## What it does (MVP)

- **Scans Reddit** (default: `r/startups`)
- **Uses OpenAI** to detect whether a post describes a real problem
- **Scores each post** from 1–10
- **Sends Telegram alerts** for high-quality opportunities (score ≥ 7 by default)
- **Runs automatically** via GitHub Actions on an hourly cron

## Installation

```bash
git clone <your-repo-url>
cd problem-radar
npm install
```

Node 18+ or 20+ is recommended.

## Environment variables

These can be set locally (e.g. using a `.env` file + a loader, or via your shell), and in GitHub as **secrets**.

- `OPENAI_API_KEY` (required) – your OpenAI API key.
- `OPENAI_MODEL` (optional) – model name, e.g. `gpt-4.1-mini`. Defaults to `gpt-4.1-mini`.
- `TELEGRAM_TOKEN` (required for alerts) – Telegram bot token from `@BotFather`.
- `TELEGRAM_CHAT_ID` (required for alerts) – chat or channel ID where alerts should be sent.
- `REDDIT_SUBREDDIT` (optional) – subreddit to scan. Default: `startups`.
- `REDDIT_LIMIT` (optional) – number of recent posts to fetch. Default: `20`.
- `MIN_OPPORTUNITY_SCORE` (optional) – minimum score (1–10) required to trigger an alert. Default: `7`.
- `OPPORTUNITY_PROMPT` (optional) – custom system-style prompt for the opportunity analyzer. If not set, a sensible default is used.

## Running locally

```bash
OPENAI_API_KEY=sk-... \
TELEGRAM_TOKEN=123:abc \
TELEGRAM_CHAT_ID=123456789 \
node radar.js
```

You should see logs about:

1. Fetching latest posts from Reddit
2. Analyzing each post with OpenAI
3. Sending Telegram alerts for high scores

## GitHub Actions automation

The workflow file is at `.github/workflows/radar.yml`.

It:

- Installs dependencies
- Runs `node radar.js`
- Is scheduled hourly:

```yaml
schedule:
  - cron: "0 * * * *"
```

### Required GitHub secrets

In your repo settings → **Secrets and variables** → **Actions**, add:

- `OPENAI_API_KEY`
- `OPENAI_MODEL` (optional)
- `TELEGRAM_TOKEN`
- `TELEGRAM_CHAT_ID`
- `REDDIT_SUBREDDIT` (optional)
- `MIN_OPPORTUNITY_SCORE` (optional)
- `OPPORTUNITY_PROMPT` (optional, great place to paste your “accelerator-grade” opportunity prompt)

After pushing to GitHub, the workflow will run every hour and you can also trigger it manually from the **Actions** tab.

