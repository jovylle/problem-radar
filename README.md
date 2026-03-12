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
- `REDDIT_CLIENT_ID` (required in CI) – Reddit app client ID. See [Request Reddit API access](#request-reddit-api-access) and [Reddit app setup](#reddit-app-setup) below.
- `REDDIT_CLIENT_SECRET` (required in CI) – Reddit app client secret.
- `REDDIT_SUBREDDIT` (optional) – subreddit to scan. Default: `startups`.
- `REDDIT_LIMIT` (optional) – number of recent posts to fetch. Default: `20`.
- `MIN_OPPORTUNITY_SCORE` (optional) – minimum score (1–10) required to trigger an alert. Default: `7`.
- `OPPORTUNITY_PROMPT` (optional) – custom system-style prompt for the opportunity analyzer. If not set, a sensible default is used.

### Request Reddit API access (do this first)

Reddit requires you to request API access and agree to their [Responsible Builder Policy](https://support.reddithelp.com/hc/en-us/articles/42728983564564-Responsible-Builder-Policy) before creating an app.

**Step 1 – Submit the request**

1. Open: **[Submit a request to Reddit](https://support.reddithelp.com/hc/en-us/requests/new)**.
2. Pick the form for **API access** or **use case not supported by Devvit** (if that's the only option).
3. Paste the text below into the description (edit the bracketed parts if you want).

**Copy-paste template:**

```
Subject: API access request – read-only personal automation (Reddit Data API)

I am requesting API access for a small personal project that uses the Reddit Data API in a read-only way.

Use case:
- Tool name: AI Opportunity Radar (or "[your project name]").
- Purpose: Fetch the latest posts from a single subreddit (e.g. r/startups) on a schedule (e.g. once per hour), analyze them locally with an AI for personal use, and send myself optional alerts via Telegram. No public-facing app, no redistribution of Reddit data, no commercial use.

Expected usage:
- API calls: About 2–3 per run (OAuth token + one listing request for ~20 posts). Runs at most once per hour. Well under 100 requests per day.
- Endpoints: OAuth token (POST) and GET listing (e.g. /r/{subreddit}/new.json).
- No posting, voting, or user data collection. Read-only.

I have read and agree to comply with the Responsible Builder Policy and Reddit's Data API terms. I will not use the data for AI training, commercialization, or resale.

Thank you for considering this request.
```

4. Submit the form. Reddit often replies within a few days.
5. After they approve, do **Reddit app setup** below to create the app and get credentials.

### Reddit app setup (after API access is approved)

Once Reddit has approved your request, create a **script** app so the radar can use OAuth (and avoid 403 in GitHub Actions):

1. Go to [https://www.reddit.com/prefs/apps](https://www.reddit.com/prefs/apps) (or [old Reddit](https://old.reddit.com/prefs/apps)).
2. If you see the Responsible Builder Policy, look for **Continue** / **I agree** to reach the app list, then click "create another app" (or "create an app").
3. Choose **“script”**.
4. Set **name** (e.g. `opportunity-radar`) and **redirect uri** (e.g. `http://localhost` — not used for script).
5. Create the app. Under the app name you’ll see:
   - **personal use script** → that’s `REDDIT_CLIENT_ID`.
   - **secret** → that’s `REDDIT_CLIENT_SECRET`.
6. Add both as repo secrets: `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`.

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
- `REDDIT_CLIENT_ID` (required so Reddit doesn’t 403 in Actions)
- `REDDIT_CLIENT_SECRET`
- `REDDIT_SUBREDDIT` (optional)
- `MIN_OPPORTUNITY_SCORE` (optional)
- `OPPORTUNITY_PROMPT` (optional, great place to paste your “accelerator-grade” opportunity prompt)

After pushing to GitHub, the workflow will run every hour and you can also trigger it manually from the **Actions** tab.

