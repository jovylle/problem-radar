/**
 * Test Reddit fetch only (no AI, no Telegram).
 * Run with: REDDIT_CLIENT_ID=xxx REDDIT_CLIENT_SECRET=xxx node test-reddit.js
 */
import { fetchRedditPosts } from './sources/reddit.js';

const subreddit = process.env.REDDIT_SUBREDDIT || 'startups';
const limit = Number(process.env.REDDIT_LIMIT || 5);

console.log('[test] Fetching from r/%s (limit=%d)...', subreddit, limit);
if (!process.env.REDDIT_CLIENT_ID || !process.env.REDDIT_CLIENT_SECRET) {
  console.warn('[test] No REDDIT_CLIENT_ID/REDDIT_CLIENT_SECRET — request may be blocked (403).');
}

try {
  const posts = await fetchRedditPosts(subreddit, limit);
  console.log('[test] OK — got %d posts', posts.length);
  posts.slice(0, 2).forEach((p, i) => {
    console.log('  %d) %s (score=%d)', i + 1, p.title.slice(0, 50) + (p.title.length > 50 ? '...' : ''), p.score);
  });
} catch (err) {
  console.error('[test] Failed:', err.message);
  process.exit(1);
}
