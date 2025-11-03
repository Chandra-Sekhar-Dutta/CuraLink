// Lightweight placeholder for AI summaries
export function summarize(text: string, max = 220): string {
  if (!text) return '';
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  // Naive sentence cut
  const sentences = clean.split(/(?<=[.!?])\s+/);
  let out = '';
  for (const s of sentences) {
    if ((out + ' ' + s).trim().length > max) break;
    out = (out ? out + ' ' : '') + s;
  }
  return out || clean.slice(0, max - 1) + '…';
}
