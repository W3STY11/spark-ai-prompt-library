#!/usr/bin/env node
/**
 * ENHANCED PROMPT IMPORT SCRIPT
 * Parses HTML files from Notion exports and extracts ALL rich content:
 * - Tips section
 * - Example Input/Output
 * - Images (screenshots)
 * - Subcategory
 * - Complexity level
 * - Structured sections
 *
 * Merges with existing prompts_index.json without creating duplicates
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROMPTS_DIR = path.join(__dirname, '..', 'Prompts');
const INDEX_PATH = path.join(__dirname, '..', 'public', 'prompts_index.json');
const BACKUP_DIR = path.join(__dirname, '..', 'backups');

// Department mapping
const DEPT_MAP = {
  'AI Prompts for Business': 'Business',
  'AI Prompts for Education': 'Education',
  'AI Prompts for Finance': 'Finance',
  'AI Prompts for Marketing': 'Marketing',
  'AI Prompts for Productivity': 'Productivity',
  'AI Prompts for SEO': 'SEO',
  'AI Prompts for Sales': 'Sales',
  'AI Prompts for Solopreneurs': 'Solopreneurs',
  'AI Prompts for Writing': 'Writing'
};

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

const stats = {
  processed: 0,
  updated: 0,
  skipped: 0,
  errors: 0,
  newTips: 0,
  newImages: 0,
  newSubcategories: 0,
  newComplexity: 0
};

/**
 * Parse HTML file and extract all rich content
 */
async function parseHTMLPrompt(htmlPath, departmentFolder) {
  const html = await fs.readFile(htmlPath, 'utf-8');
  const $ = cheerio.load(html);

  const data = {
    title: '',
    subcategory: '',
    date: '',
    description: '',
    content: '',
    tips: [],
    images: [],
    exampleInput: '',
    exampleOutput: '',
    howToUse: '',
    whatItDoes: '',
    additionalTips: '',
    complexity: ''
  };

  // Extract title
  data.title = $('.page-title').first().text().trim();

  // Extract subcategory from properties table
  $('.property-row-multi_select td .selected-value').each((i, el) => {
    const subcategory = $(el).text().trim();
    if (subcategory) data.subcategory = subcategory;
  });

  // Extract date
  const dateText = $('time').first().text().trim();
  if (dateText) {
    // Convert "@August 14, 2024" to "2024-08-14"
    const match = dateText.match(/@(\w+)\s+(\d+),\s+(\d+)/);
    if (match) {
      const months = {'January':1,'February':2,'March':3,'April':4,'May':5,'June':6,'July':7,'August':8,'September':9,'October':10,'November':11,'December':12};
      const month = months[match[1]];
      const day = match[2].padStart(2, '0');
      const year = match[3];
      data.date = `${year}-${month.toString().padStart(2,'0')}-${day}`;
    }
  }

  // Extract description from callout
  const callout = $('.callout').first();
  data.description = callout.find('p').text().trim();

  // Extract main prompt content (code block)
  const codeBlock = $('pre code').first();
  data.content = codeBlock.text().trim();

  // Extract "What This Mega-Prompt Does" section
  let whatItDoesSection = '';
  $('h2').each((i, el) => {
    const heading = $(el).text().trim();
    if (heading.includes('What This Mega-Prompt Does')) {
      let nextEl = $(el).next();
      const bullets = [];
      while (nextEl.length && !nextEl.is('h2')) {
        if (nextEl.is('p')) {
          const text = nextEl.text().trim();
          // Split by bullet points if present
          const lines = text.split(/[●•]\s+/).filter(l => l.trim());
          bullets.push(...lines);
        }
        nextEl = nextEl.next();
      }
      data.whatItDoes = bullets.join('\\n');
    }
  });

  // Extract Tips section(s)
  const tipsSections = [];
  $('h2').each((i, el) => {
    const heading = $(el).text().trim();
    if (heading.includes('Tips') || heading.includes('💡')) {
      let nextEl = $(el).next();
      const bullets = [];
      while (nextEl.length && !nextEl.is('h2')) {
        if (nextEl.is('p')) {
          const text = nextEl.text().trim();
          // Split by bullet points
          const lines = text.split(/[●•]\s+/).filter(l => l.trim());
          bullets.push(...lines);
        }
        nextEl = nextEl.next();
      }
      tipsSections.push(...bullets);
    }
  });
  data.tips = [...new Set(tipsSections)].filter(t => t.length > 10); // Remove duplicates and very short tips

  // Extract "How To Use" section
  $('h2').each((i, el) => {
    const heading = $(el).text().trim();
    if (heading.includes('How To Use')) {
      let nextEl = $(el).next();
      const content = [];
      while (nextEl.length && !nextEl.is('h2')) {
        if (nextEl.is('p')) {
          content.push(nextEl.text().trim());
        }
        nextEl = nextEl.next();
      }
      data.howToUse = content.join('\\n\\n');
    }
  });

  // Extract Example Input section
  $('h2').each((i, el) => {
    const heading = $(el).text().trim();
    if (heading.includes('Example Input') || heading.includes('📥')) {
      let nextEl = $(el).next();
      const content = [];
      while (nextEl.length && !nextEl.is('h2')) {
        if (nextEl.is('p')) {
          content.push(nextEl.text().trim());
        }
        nextEl = nextEl.next();
      }
      data.exampleInput = content.join('\\n\\n');
    }
  });

  // Extract images
  $('img').each((i, el) => {
    const src = $(el).attr('src');
    if (src && src.includes('.png') && !src.includes('notion.so/icons')) {
      // Extract just the filename
      const filename = path.basename(src);
      data.images.push(filename);
    }
  });

  // Infer complexity from content length and structure
  const contentLength = data.content.length;
  const hasMultiplePhases = data.content.includes('PHASE') || data.content.includes('Phase');
  const hasComplexStructure = data.content.split('#').length > 5;

  if (contentLength > 3000 || hasMultiplePhases) {
    data.complexity = 'advanced';
  } else if (contentLength > 1500 || hasComplexStructure) {
    data.complexity = 'intermediate';
  } else {
    data.complexity = 'beginner';
  }

  return data;
}

/**
 * Generate consistent ID from title and department
 */
function generatePromptId(title, department) {
  const normalized = `${department}_${title}`.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  return crypto.createHash('md5').update(normalized).digest('hex');
}

/**
 * Match HTML data to existing prompt
 */
function findMatchingPrompt(existingPrompts, htmlData, department) {
  // Try to find by title match
  const titleMatch = existingPrompts.find(p =>
    p.title.toLowerCase().trim() === htmlData.title.toLowerCase().trim() &&
    p.department === department
  );

  return titleMatch;
}

/**
 * Merge HTML rich data into existing prompt
 */
function mergePromptData(existing, htmlData) {
  const updated = { ...existing };
  let changes = [];

  // Update subcategory if missing
  if (htmlData.subcategory && !existing.subcategory) {
    updated.subcategory = htmlData.subcategory;
    changes.push('subcategory');
  }

  // Update complexity if missing
  if (htmlData.complexity && (!existing.complexity || existing.complexity === '')) {
    updated.complexity = htmlData.complexity;
    changes.push('complexity');
  }

  // Update tips if missing or empty
  if (htmlData.tips.length > 0 && (!existing.tips || existing.tips.length === 0)) {
    updated.tips = htmlData.tips;
    changes.push('tips');
  }

  // Update images if missing or empty
  if (htmlData.images.length > 0 && (!existing.images || existing.images.length === 0)) {
    updated.images = htmlData.images;
    changes.push('images');
  }

  // Add structured sections as metadata
  if (!updated.metadata) {
    updated.metadata = {};
  }

  if (htmlData.whatItDoes && !updated.metadata.whatItDoes) {
    updated.metadata.whatItDoes = htmlData.whatItDoes;
    changes.push('whatItDoes');
  }

  if (htmlData.howToUse && !updated.metadata.howToUse) {
    updated.metadata.howToUse = htmlData.howToUse;
    changes.push('howToUse');
  }

  if (htmlData.exampleInput && !updated.metadata.exampleInput) {
    updated.metadata.exampleInput = htmlData.exampleInput;
    changes.push('exampleInput');
  }

  return { updated, changes };
}

/**
 * Main import function
 */
async function importRichContent() {
  console.log('🚀 SPARK Prompt Library - Rich Content Import\\n');

  // Load existing index
  const indexData = await fs.readFile(INDEX_PATH, 'utf-8');
  const index = JSON.parse(indexData);
  console.log(`✓ Loaded existing index: ${index.prompts.length} prompts\\n`);

  // Create backup
  await fs.mkdir(BACKUP_DIR, { recursive: true });
  const backupPath = path.join(BACKUP_DIR, `prompts_backup_before_rich_import_${Date.now()}.json`);
  await fs.writeFile(backupPath, indexData);
  console.log(`✓ Backup created: ${path.basename(backupPath)}\\n`);

  // Process each department
  const departments = Object.keys(DEPT_MAP);

  for (const deptFolder of departments) {
    const department = DEPT_MAP[deptFolder];
    const deptPath = path.join(PROMPTS_DIR, deptFolder);

    console.log(`\\n📁 Processing: ${department}`);
    console.log('─'.repeat(50));

    try {
      const files = await fs.readdir(deptPath);
      const htmlFiles = files.filter(f => f.endsWith('.html'));

      console.log(`   Found ${htmlFiles.length} HTML files`);

      for (const htmlFile of htmlFiles) {
        const htmlPath = path.join(deptPath, htmlFile);

        try {
          // Parse HTML
          const htmlData = await parseHTMLPrompt(htmlPath, deptFolder);
          stats.processed++;

          // Find matching prompt in existing data
          const match = findMatchingPrompt(index.prompts, htmlData, department);

          if (match) {
            // Merge rich data
            const { updated, changes } = mergePromptData(match, htmlData);

            if (changes.length > 0) {
              // Replace in array
              const idx = index.prompts.findIndex(p => p.id === match.id);
              index.prompts[idx] = updated;

              stats.updated++;
              if (changes.includes('tips')) stats.newTips++;
              if (changes.includes('images')) stats.newImages++;
              if (changes.includes('subcategory')) stats.newSubcategories++;
              if (changes.includes('complexity')) stats.newComplexity++;

              if (stats.updated % 100 === 0) {
                process.stdout.write(`\\r   Updated: ${stats.updated}/${stats.processed}`);
              }
            } else {
              stats.skipped++;
            }
          } else {
            // console.log(`   ⚠️  No match found for: ${htmlData.title}`);
            stats.skipped++;
          }

        } catch (err) {
          console.error(`   ❌ Error processing ${htmlFile}:`, err.message);
          stats.errors++;
        }
      }

      console.log(`\\r   Updated: ${stats.updated}, Skipped: ${stats.skipped}`);

    } catch (err) {
      console.error(`   ❌ Error reading department:`, err.message);
    }
  }

  // Save updated index
  await fs.writeFile(INDEX_PATH, JSON.stringify(index, null, 2));
  console.log(`\\n✅ Updated index saved: ${INDEX_PATH}`);

  // Print summary
  console.log('\\n' + '='.repeat(60));
  console.log('📊 IMPORT SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total HTML files processed: ${stats.processed}`);
  console.log(`Prompts updated: ${stats.updated}`);
  console.log(`Prompts skipped (no changes): ${stats.skipped}`);
  console.log(`Errors: ${stats.errors}`);
  console.log('\\nRich Content Added:');
  console.log(`  • Tips sections: ${stats.newTips}`);
  console.log(`  • Image references: ${stats.newImages}`);
  console.log(`  • Subcategories: ${stats.newSubcategories}`);
  console.log(`  • Complexity levels: ${stats.newComplexity}`);
  console.log('\\n' + '='.repeat(60));
  console.log('✅ Import complete!');
}

// Run import
importRichContent().catch(console.error);
