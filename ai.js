import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

function buildPrompt(post) {
  const basePrompt = process.env.OPPORTUNITY_PROMPT
    ? process.env.OPPORTUNITY_PROMPT
    : `You are an AI used by startup founders to detect real business opportunities from online discussions.

Given a post (title and body), decide if it describes a real, painful problem that could be solved by a software product or service.

Return ONLY a JSON object with this exact shape and no extra text:
{
  "score": number (1-10, integer),
  "reason": string,
  "productIdea": string
}

- score 1-3: not a real problem or just a meme
- score 4-6: some annoyance but weak signal
- score 7-8: clear pain point with potential
- score 9-10: very strong recurring problem that many people likely have

Focus on freelancers, creators, developers, small businesses, or SaaS-like opportunities when relevant.`;

  return `${basePrompt}

Post title:
${post.title}

Post body:
${post.body || '(no body)'}`;
}

export async function analyzeOpportunity(post) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('Missing OPENAI_API_KEY environment variable');
  }

  const prompt = buildPrompt(post);

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.2,
  });

  const content = completion.choices?.[0]?.message?.content || '';

  let parsed;
  try {
    const jsonTextMatch = content.match(/\{[\s\S]*\}/);
    const jsonText = jsonTextMatch ? jsonTextMatch[0] : content;
    parsed = JSON.parse(jsonText);
  } catch (err) {
    throw new Error(`Failed to parse AI response as JSON: ${err.message}\nRaw content: ${content}`);
  }

  const score = Number.isFinite(parsed.score) ? Math.round(Number(parsed.score)) : 0;

  return {
    score,
    reason: parsed.reason || '',
    productIdea: parsed.productIdea || '',
    raw: content,
  };
}

