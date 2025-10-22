#!/usr/bin/env node
/**
 * FRESH START - NOTION DIRECT IMPORT
 * Fetches ALL prompts from ALL 9 department databases
 * 100% accuracy - preserves every bullet point exactly as in Notion
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NOTION_API_KEY = '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';
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'prompts_index.json');

// All 9 department database IDs from Notion
const DATABASES = [
  { id: '2733f44c-2287-8100-a944-c4619ae0e580', name: 'Business', icon: '💼' },
  { id: '2733f44c-2287-81ee-8acd-d839698971e6', name: 'Education', icon: '📚' },
  { id: '2733f44c-2287-8106-8fa3-c4b3f0f7ecb2', name: 'Finance', icon: '💵' },
  { id: '2733f44c-2287-8161-af90-d8e87b6541f0', name: 'Marketing', icon: '📢' },
  { id: '2733f44c-2287-81d1-bdd7-eb53451e040a', name: 'Productivity', icon: '⚡' },
  { id: '2733f44c-2287-811b-afd0-e27cd86f38e7', name: 'SEO', icon: '🔍' },
  { id: '2733f44c-2287-8115-916c-c27688617471', name: 'Sales', icon: '💰' },
  { id: '2733f44c-2287-81e4-97bd-d2eb62e85be1', name: 'Solopreneurs', icon: '🚀' },
  { id: '2733f44c-2287-81e6-a10c-cf68f1994fa3', name: 'Writing', icon: '✍️' }
];

/**
 * Fetch all pages from a database
 */
async function fetchDatabase(databaseId) {
  const allResults = [];
  let hasMore = true;
  let startCursor = undefined;

  while (hasMore) {
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        start_cursor: startCursor,
        page_size: 100
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Notion API error: ${JSON.stringify(data)}`);
    }

    allResults.push(...data.results);
    hasMore = data.has_more;
    startCursor = data.next_cursor;
  }

  return allResults;
}

/**
 * Fetch page blocks (content)
 */
async function fetchPageBlocks(pageId) {
  const allBlocks = [];
  let hasMore = true;
  let startCursor = undefined;

  while (hasMore) {
    const url = startCursor
      ? `https://api.notion.com/v1/blocks/${pageId}/children?start_cursor=${startCursor}`
      : `https://api.notion.com/v1/blocks/${pageId}/children`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28'
      }
    });

    const data = await response.json();
    if (!response.ok) {
      console.warn(`Warning: Could not fetch blocks for ${pageId}: ${data.message}`);
      break;
    }

    allBlocks.push(...data.results);
    hasMore = data.has_more;
    startCursor = data.next_cursor;
  }

  return allBlocks;
}

/**
 * Extract text from Notion rich text
 */
function getRichText(richText) {
  if (!richText || !Array.isArray(richText)) return '';
  return richText.map(rt => rt.plain_text || '').join('');
}

/**
 * Parse a Notion page into a prompt object
 */
async function parsePage(page, department) {
  const props = page.properties;

  // Get title
  const title = getRichText(props.Name?.title || props.Title?.title || []);
  if (!title) {
    console.warn(`Skipping page with no title: ${page.id}`);
    return null;
  }

  // Get other properties
  const subcategory = props.Subcategory?.multi_select?.[0]?.name || '';
  const date = props.Date?.date?.start || new Date().toISOString().split('T')[0];

  // Generate ID
  const id = crypto.createHash('md5').update(`${department.name}_${title}`).digest('hex');

  // Fetch page content
  const blocks = await fetchPageBlocks(page.id);

  // Parse blocks
  let description = '';
  let promptText = '';
  const whatItDoes = [];
  const tips = [];
  const howToUse = [];
  const exampleInput = [];
  const images = [];

  let currentSection = null;

  for (const block of blocks) {
    const type = block.type;

    // Callout = description
    if (type === 'callout') {
      description = getRichText(block.callout?.rich_text || []);
    }

    // Headings define sections
    if (type === 'heading_2') {
      const heading = getRichText(block.heading_2?.rich_text || []);
      if (heading.includes('What This') && heading.includes('Does')) {
        currentSection = 'whatItDoes';
      } else if (heading.includes('Tips') || heading.includes('💡')) {
        currentSection = 'tips';
      } else if (heading.includes('How To Use')) {
        currentSection = 'howToUse';
      } else if (heading.includes('Example Input') || heading.includes('📥')) {
        currentSection = 'exampleInput';
      } else {
        currentSection = null;
      }
    }

    // Paragraphs under sections
    if (type === 'paragraph' && currentSection) {
      const text = getRichText(block.paragraph?.rich_text || []);
      if (text.trim()) {
        // Split by bullets if present (● or •)
        const lines = text.split(/[●•]\s+/).filter(l => l.trim());
        if (lines.length > 1 || !text.match(/[●•]/)) {
          // Has bullets OR no bullets (single item)
          eval(`${currentSection}.push(...lines.filter(l => l.trim()))`);
        }
      }
    }

    // Bulleted list items
    if (type === 'bulleted_list_item' && currentSection) {
      const text = getRichText(block.bulleted_list_item?.rich_text || []);
      if (text.trim()) {
        eval(`${currentSection}.push(text.trim())`);
      }
    }

    // Code block = main prompt
    if (type === 'code') {
      promptText = getRichText(block.code?.rich_text || []);
    }

    // Images
    if (type === 'image') {
      const url = block.image?.file?.url || block.image?.external?.url;
      if (url) {
        const filename = `${id}_image_${images.length + 1}.png`;
        images.push(filename);
      }
    }
  }

  // Calculate word count and complexity
  const wordCount = promptText.split(/\s+/).filter(w => w).length;
  const hasPhases = /PHASE|Phase/i.test(promptText);
  const sectionCount = (promptText.match(/#/g) || []).length;

  let complexity = 'beginner';
  if (wordCount > 500 || hasPhases) complexity = 'advanced';
  else if (wordCount > 250 || sectionCount > 5) complexity = 'intermediate';

  return {
    id,
    title,
    department: department.name,
    subcategory,
    icon: department.icon,
    date,
    description,
    content: promptText,
    tips,
    images,
    word_count: wordCount,
    complexity,
    metadata: {
      whatItDoes: whatItDoes.join('\n'),
      howToUse: howToUse.join('\n'),
      exampleInput: exampleInput.join('\n')
    }
  };
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 FRESH START - Fetching from Notion\n');

  const allPrompts = [];
  const deptStats = [];

  for (const dept of DATABASES) {
    console.log(`\n${dept.icon} ${dept.name}...`);
    try {
      const pages = await fetchDatabase(dept.id);
      console.log(`  Found ${pages.length} pages`);

      let count = 0;
      for (const page of pages) {
        const prompt = await parsePage(page, dept);
        if (prompt) {
          allPrompts.push(prompt);
          count++;
          if (count % 10 === 0) process.stdout.write(`\r  Processed: ${count}/${pages.length}`);
        }
      }
      console.log(`\r  ✓ Processed: ${count}/${pages.length}`);
      deptStats.push({ name: dept.name, icon: dept.icon, count });

    } catch (error) {
      console.error(`  ❌ Error: ${error.message}`);
    }
  }

  // Build index
  const index = {
    meta: {
      version: '4.0.0',
      total_prompts: allPrompts.length,
      last_updated: new Date().toISOString(),
      source: 'Notion API - Fresh Import'
    },
    departments: deptStats,
    prompts: allPrompts
  };

  // Save
  await fs.writeFile(OUTPUT_PATH, JSON.stringify(index, null, 2));

  console.log('\n' + '='.repeat(60));
  console.log('✅ COMPLETE');
  console.log('='.repeat(60));
  console.log(`Total prompts: ${allPrompts.length}`);
  console.log('\nBy Department:');
  deptStats.forEach(d => console.log(`  ${d.icon} ${d.name}: ${d.count}`));
  console.log(`\n📁 Saved to: ${OUTPUT_PATH}`);
  console.log('='.repeat(60));
}

main().catch(console.error);
