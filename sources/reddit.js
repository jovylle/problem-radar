import fetch from 'node-fetch';

const USER_AGENT =
  'ai-opportunity-radar/1.0 (by u/opportunity-radar-bot; read-only opportunity scanner)';

async function getRedditAccessToken() {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': USER_AGENT,
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Reddit OAuth failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const data = await res.json();
  return data.access_token;
}

export async function fetchRedditPosts(subreddit = 'startups', limit = 20) {
  const baseUrl = 'https://oauth.reddit.com';
  const url = `${baseUrl}/r/${subreddit}/new.json?limit=${limit}`;

  const headers = {
    'User-Agent': USER_AGENT,
  };

  const token = await getRedditAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, { headers });

  if (!res.ok) {
    const body = await res.text();
    if (res.status === 403 && !token) {
      throw new Error(
        'Reddit returned 403 (blocked). Add REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET from https://www.reddit.com/prefs/apps (create a "script" app) and set them as repo secrets.'
      );
    }
    throw new Error(`Reddit request failed: ${res.status} ${res.statusText} - ${body}`);
  }

  const json = await res.json();

  const posts = (json.data?.children || [])
    .map((child) => child.data)
    .filter((d) => !!d)
    .map((d) => ({
      id: d.id,
      title: d.title,
      body: d.selftext || '',
      url: `https://www.reddit.com${d.permalink}`,
      createdUtc: d.created_utc,
      score: d.score,
      numComments: d.num_comments,
      subreddit: d.subreddit,
    }));

  return posts;
}

