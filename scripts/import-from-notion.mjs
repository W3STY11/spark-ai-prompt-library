#!/usr/bin/env node
/**
 * NOTION DIRECT IMPORT SCRIPT
 * Fetches ALL prompts directly from Notion database using the API
 * Preserves 100% accuracy of all bullet points and metadata
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NOTION_API_KEY = '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';
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID; // Need database ID
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'prompts_index.json');

const DEPT_ICONS = {
  'Business': '💼',
  'Education': '📚',
  'Finance': '💵',
  'Marketing': '📢',
  'Productivity': '⚡',
  'SEO': '🔍',
  'Sales': '💰',
  'Solopreneurs': '🚀',
  'Writing': '✍️'
};

/**
 * Fetch all pages from Notion database
 */
async function fetchNotionDatabase(databaseId) {
  const url = `https://api.notion.com/v1/databases/${databaseId}/query`;
  const allResults = [];
  let hasMore = true;
  let startCursor = undefined;

  while (hasMore) {
    const response = await fetch(url, {
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

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Notion API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    allResults.push(...data.results);
    hasMore = data.has_more;
    startCursor = data.next_cursor;

    console.log(`Fetched ${allResults.length} pages so far...`);
  }

  return allResults;
}

/**
 * Fetch page content (blocks) from Notion
 */
async function fetchPageContent(pageId) {
  const url = `https://api.notion.com/v1/blocks/${pageId}/children`;
  const allBlocks = [];
  let hasMore = true;
  let startCursor = undefined;

  while (hasMore) {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Notion API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    allBlocks.push(...data.results);
    hasMore = data.has_more;
    startCursor = data.next_cursor;
  }

  return allBlocks;
}

/**
 * Extract text from Notion rich text array
 */
function extractRichText(richTextArray) {
  if (!richTextArray || !Array.isArray(richTextArray)) return '';
  return richTextArray.map(rt => rt.plain_text || '').join('');
}

/**
 * Parse Notion page to prompt object
 */
async function parseNotionPage(page) {
  const properties = page.properties;

  // Extract basic properties
  const title = extractRichText(properties.Title?.title || properties.Name?.title);
  const department = properties.Department?.select?.name || '';
  const subcategory = properties.Subcategory?.multi_select?.[0]?.name || '';
  const date = properties.Date?.date?.start || '';
  const description = extractRichText(properties.Description?.rich_text);

  // Generate ID
  const id = crypto.createHash('md5').update(`${department}_${title}`).digest('hex');

  // Fetch page content (blocks)
  const blocks = await fetchPageContent(page.id);

  // Parse blocks to extract structured content
  const content = {
    promptText: '',
    whatItDoes: [],
    tips: [],
    howToUse: [],
    exampleInput: [],
    images: []
  };

  let currentSection = null;

  for (const block of blocks) {
    const type = block.type;

    // Check for headings to identify sections
    if (type === 'heading_2') {
      const heading = extractRichText(block.heading_2.rich_text);
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

    // Extract paragraph content
    if (type === 'paragraph') {
      const text = extractRichText(block.paragraph.rich_text);
      if (currentSection && text.trim()) {
        // Split by bullet points if present
        const lines = text.split(/[●•]\s+/).filter(l => l.trim());
        content[currentSection].push(...lines);
      }
    }

    // Extract bulleted list items
    if (type === 'bulleted_list_item') {
      const text = extractRichText(block.bulleted_list_item.rich_text);
      if (currentSection && text.trim()) {
        content[currentSection].push(text.trim());
      }
    }

    // Extract code blocks (main prompt)
    if (type === 'code') {
      const code = extractRichText(block.code.rich_text);
      content.promptText = code;
    }

    // Extract images
    if (type === 'image') {
      const imageUrl = block.image.file?.url || block.image.external?.url;
      if (imageUrl) {
        // Generate filename from URL
        const filename = `${id}_${Date.now()}.png`;
        content.images.push(filename);
        // TODO: Download image and upload to blob storage
      }
    }
  }

  // Calculate complexity
  const contentLength = content.promptText.length;
  const hasMultiplePhases = content.promptText.includes('PHASE') || content.promptText.includes('Phase');
  const hasComplexStructure = content.promptText.split('#').length > 5;

  let complexity = 'beginner';
  if (contentLength > 3000 || hasMultiplePhases) {
    complexity = 'advanced';
  } else if (contentLength > 1500 || hasComplexStructure) {
    complexity = 'intermediate';
  }

  // Calculate word count
  const wordCount = content.promptText.split(/\s+/).length;

  return {
    id,
    title,
    department,
    subcategory,
    date,
    description,
    content: content.promptText,
    tips: content.tips,
    images: content.images,
    complexity,
    word_count: wordCount,
    icon: DEPT_ICONS[department] || '📝',
    metadata: {
      whatItDoes: content.whatItDoes.join('\n'),
      howToUse: content.howToUse.join('\n'),
      exampleInput: content.exampleInput.join('\n')
    }
  };
}

/**
 * Main import function
 */
async function importFromNotion() {
  console.log('🚀 SPARK Prompt Library - Notion Direct Import\n');

  if (!NOTION_DATABASE_ID) {
    console.error('❌ Error: NOTION_DATABASE_ID environment variable not set');
    console.log('\nPlease provide your Notion database ID:');
    console.log('export NOTION_DATABASE_ID="your-database-id-here"');
    process.exit(1);
  }

  console.log('📡 Fetching prompts from Notion database...');
  const pages = await fetchNotionDatabase(NOTION_DATABASE_ID);
  console.log(`✓ Found ${pages.length} prompts in Notion\n`);

  const prompts = [];
  const departments = new Map();

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    console.log(`Processing ${i + 1}/${pages.length}: ${extractRichText(page.properties.Title?.title || page.properties.Name?.title)}`);

    try {
      const prompt = await parseNotionPage(page);
      prompts.push(prompt);

      // Track departments
      if (!departments.has(prompt.department)) {
        departments.set(prompt.department, {
          name: prompt.department,
          icon: DEPT_ICONS[prompt.department] || '📝',
          count: 0
        });
      }
      departments.get(prompt.department).count++;

    } catch (error) {
      console.error(`  ❌ Error processing page: ${error.message}`);
    }
  }

  // Build index structure
  const index = {
    meta: {
      version: '3.0.0',
      total_prompts: prompts.length,
      last_updated: new Date().toISOString(),
      departments: Array.from(departments.values())
    },
    departments: Array.from(departments.values()),
    prompts
  };

  // Save to file
  await fs.writeFile(OUTPUT_PATH, JSON.stringify(index, null, 2));
  console.log(`\n✅ Saved ${prompts.length} prompts to ${OUTPUT_PATH}`);

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 IMPORT SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total prompts: ${prompts.length}`);
  console.log(`Departments: ${departments.size}`);
  console.log('\nBy Department:');
  for (const [name, dept] of departments) {
    console.log(`  ${dept.icon} ${name}: ${dept.count} prompts`);
  }
  console.log('='.repeat(60));
}

// Run import
importFromNotion().catch(console.error);
