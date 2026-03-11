import { fetchRedditPosts } from './sources/reddit.js';
import { analyzeOpportunity } from './ai.js';
import { sendTelegramAlert } from './notify.js';

const DEFAULT_MIN_SCORE = 7;

export async function runRadar() {
  const subreddit = process.env.REDDIT_SUBREDDIT || 'startups';
  const limit = Number(process.env.REDDIT_LIMIT || 20);
  const minScore = Number(process.env.MIN_OPPORTUNITY_SCORE || DEFAULT_MIN_SCORE);

  console.log(`[radar] Fetching latest posts from r/${subreddit} (limit=${limit})`);

  const posts = await fetchRedditPosts(subreddit, limit);
  console.log(`[radar] Got ${posts.length} posts from Reddit`);

  for (const post of posts) {
    try {
      console.log(`[radar] Analyzing post: ${post.title}`);
      const analysis = await analyzeOpportunity(post);
      console.log(
        `[radar] Score for "${post.title.slice(0, 60)}..." => ${analysis.score}/10`
      );

      if (analysis.score >= minScore) {
        console.log(
          `[radar] High-scoring opportunity detected (${analysis.score}/10). Sending Telegram alert.`
        );
        await sendTelegramAlert({
          ...post,
          score: analysis.score,
          reason: analysis.reason,
          productIdea: analysis.productIdea,
        });
      }
    } catch (err) {
      console.error('[radar] Error analyzing/sending alert for post', {
        title: post.title,
        url: post.url,
        error: err.message,
      });
    }
  }

  console.log('[radar] Run completed.');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runRadar().catch((err) => {
    console.error('[radar] Fatal error:', err);
    process.exit(1);
  });
}

