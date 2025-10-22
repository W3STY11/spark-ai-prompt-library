// CI prep: download live prompts_index.json and optionally sample it
import fs from 'fs';
import path from 'path';

const fetchUrl = process.env.PROMPTS_INDEX_URL || 'https://gray-ocean-059c8510f.3.azurestaticapps.net/prompts_index.json';
const limit = parseInt(process.env.PROMPT_SAMPLE_LIMIT || '300', 10);
const outDir = path.join(process.cwd(), 'public');
const outFile = path.join(outDir, 'prompts_index.json');

async function main() {
  console.log(`CI prep: fetching ${fetchUrl}`);
  const res = await fetch(fetchUrl);
  if (!res.ok) throw new Error(`Failed to fetch prompts_index.json: ${res.status} ${res.statusText}`);

  let data = await res.json();

  if (Array.isArray(data) && limit && data.length > limit) {
    data = data.slice(0, limit);
    console.log(`Sampled prompts to first ${limit} items for CI.`);
  }

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(data));
  console.log(`Wrote ${Array.isArray(data) ? data.length : '?'} prompts to ${outFile}`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
