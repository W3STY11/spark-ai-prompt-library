// CI prep: fetch production prompts_index.json, sample, and STRIP heavy fields
import fs from 'fs';
import path from 'path';

const fetchUrl = process.env.PROMPTS_INDEX_URL
  || 'https://gray-ocean-059c8510f.3.azurestaticapps.net/prompts_index.json';
// Smaller default sample to reduce bundle size further for CI previews
const limit = parseInt(process.env.PROMPT_SAMPLE_LIMIT || '120', 10);
const outDir = path.join(process.cwd(), 'public');
const outFile = path.join(outDir, 'prompts_index.json');

function textOnly(html = '') {
  // very light HTML strip for description fallback
  return String(html).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function slimPrompt(p) {
  // Compute small fields BEFORE dropping heavies
  const has_image = Array.isArray(p?.images) && p.images.length > 0;
  let word_count = typeof p?.word_count === 'number' ? p.word_count : undefined;
  if (!word_count && typeof p?.content === 'string') {
    word_count = textOnly(p.content).split(/\s+/).filter(Boolean).length || undefined;
  }
  const description = p?.description ?? (typeof p?.content === 'string'
    ? textOnly(p.content).slice(0, 160) : '');

  // Keep ONLY what the Browse page needs
  const slim = {
    id: p?.id ?? p?.slug ?? p?.uid ?? undefined,
    title: p?.title ?? '',
    department: p?.department ?? p?.category ?? '',
    description,
    tags: Array.isArray(p?.tags) ? p.tags.slice(0, 6) : [],
    icon: p?.icon ?? '🧩',
    word_count,
    has_image,
  };
  return slim;
}

async function main() {
  console.log(`CI prep: fetching ${fetchUrl}`);
  const res = await fetch(fetchUrl);
  if (!res.ok) throw new Error(`Failed to fetch prompts_index.json: ${res.status} ${res.statusText}`);
  let json = await res.json();

  // Handle both array format and object format { prompts: [...] }
  let data = Array.isArray(json) ? json : (json.prompts || []);
  if (!Array.isArray(data)) throw new Error('prompts_index.json has no prompts array');

  if (limit && data.length > limit) {
    console.log(`Sampling prompts to first ${limit} items for CI.`);
    data = data.slice(0, limit);
  }
  const slim = data.map(slimPrompt);
  fs.mkdirSync(outDir, { recursive: true });

  // Ensure no thumbnails or prompt HTML files land in public
  const thumbsDir = path.join(outDir, 'thumbnails');
  if (fs.existsSync(thumbsDir)) {
    fs.rmSync(thumbsDir, { recursive: true, force: true });
    console.log('Removed public/thumbnails from CI build.');
  }

  const promptsDir = path.join(outDir, 'prompts');
  if (fs.existsSync(promptsDir)) {
    fs.rmSync(promptsDir, { recursive: true, force: true });
    console.log('Removed public/prompts from CI build.');
  }

  fs.writeFileSync(outFile, JSON.stringify(slim));
  console.log(`Wrote ${slim.length} slim prompts to ${outFile}`);
}

main().catch(e => { console.error(e); process.exit(1); });
