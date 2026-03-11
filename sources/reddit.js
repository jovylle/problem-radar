import fetch from 'node-fetch';

export async function fetchRedditPosts(subreddit = 'startups', limit = 20) {
  const url = `https://www.reddit.com/r/${subreddit}/new.json?limit=${limit}`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'ai-opportunity-radar/0.1 (by u/opportunity-radar-bot)',
    },
  });

  if (!res.ok) {
    throw new Error(`Reddit request failed: ${res.status} ${res.statusText}`);
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

