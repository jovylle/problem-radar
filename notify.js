import fetch from 'node-fetch';

function formatOpportunityMessage(opportunity) {
  const lines = [];
  lines.push('🚨 *Opportunity Found*');
  lines.push('');
  lines.push(`*Source*: Reddit r/${opportunity.subreddit || 'startups'}`);
  lines.push(`*Score*: ${opportunity.score}/10`);
  lines.push('');
  lines.push('*Problem* (from post):');
  lines.push(opportunity.title);
  if (opportunity.body) {
    const trimmedBody = opportunity.body.length > 400 ? `${opportunity.body.slice(0, 400)}...` : opportunity.body;
    lines.push('');
    lines.push(trimmedBody);
  }
  if (opportunity.productIdea) {
    lines.push('');
    lines.push('*Possible Product:*');
    lines.push(opportunity.productIdea);
  }
  lines.push('');
  lines.push('*Reasoning:*');
  lines.push(opportunity.reason || 'N/A');
  lines.push('');
  lines.push('*Link:*');
  lines.push(opportunity.url);

  return lines.join('\n');
}

export async function sendTelegramAlert(opportunity) {
  const token = process.env.TELEGRAM_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn(
      'Skipping Telegram notification because TELEGRAM_TOKEN or TELEGRAM_CHAT_ID is not set.'
    );
    return;
  }

  const text = formatOpportunityMessage(opportunity);

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
      disable_web_page_preview: false,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Telegram API error: ${res.status} ${res.statusText} - ${body}`);
  }
}

