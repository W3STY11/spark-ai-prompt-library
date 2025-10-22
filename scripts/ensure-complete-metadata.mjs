#!/usr/bin/env node

/**
 * ENSURE COMPLETE METADATA FOR ALL PROMPTS
 *
 * This script ensures that EVERY prompt has ALL metadata fields populated.
 * Fields that are missing will be populated with appropriate defaults.
 *
 * Required fields for each prompt:
 * - tips: Array of tips (minimum empty array)
 * - images: Array of image filenames (minimum empty array)
 * - tags: Array of tags (minimum empty array)
 * - complexity: One of 'beginner', 'intermediate', 'advanced'
 * - metadata: Object with whatItDoes, howToUse, exampleInput
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROMPTS_INDEX_PATH = path.join(__dirname, '../public/prompts_index.json');
const BACKUP_PATH = path.join(__dirname, '../public/prompts_index_backup_before_metadata_fix.json');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

console.log(`${colors.bold}${colors.cyan}========================================${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}ENSURE COMPLETE METADATA FOR ALL PROMPTS${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}========================================${colors.reset}\n`);

// Read the prompts index
console.log(`${colors.blue}Reading prompts index...${colors.reset}`);
const data = JSON.parse(fs.readFileSync(PROMPTS_INDEX_PATH, 'utf8'));

console.log(`${colors.green}✓ Loaded ${data.prompts.length} prompts${colors.reset}\n`);

// Analyze current data completeness
console.log(`${colors.bold}${colors.yellow}ANALYZING DATA COMPLETENESS:${colors.reset}`);

const stats = {
  total: data.prompts.length,
  missingTips: 0,
  missingImages: 0,
  missingTags: 0,
  missingComplexity: 0,
  missingMetadata: 0,
  missingWhatItDoes: 0,
  missingHowToUse: 0,
  missingExampleInput: 0,
  emptyTips: 0,
  emptyImages: 0,
  emptyTags: 0
};

data.prompts.forEach(prompt => {
  // Check for missing or empty tips
  if (!prompt.tips) {
    stats.missingTips++;
  } else if (Array.isArray(prompt.tips) && prompt.tips.length === 0) {
    stats.emptyTips++;
  }

  // Check for missing or empty images
  if (!prompt.images) {
    stats.missingImages++;
  } else if (Array.isArray(prompt.images) && prompt.images.length === 0) {
    stats.emptyImages++;
  }

  // Check for missing or empty tags
  if (!prompt.tags) {
    stats.missingTags++;
  } else if (Array.isArray(prompt.tags) && prompt.tags.length === 0) {
    stats.emptyTags++;
  }

  // Check for missing complexity
  if (!prompt.complexity) {
    stats.missingComplexity++;
  }

  // Check for missing metadata
  if (!prompt.metadata) {
    stats.missingMetadata++;
  } else {
    if (!prompt.metadata.whatItDoes) stats.missingWhatItDoes++;
    if (!prompt.metadata.howToUse) stats.missingHowToUse++;
    if (!prompt.metadata.exampleInput) stats.missingExampleInput++;
  }
});

// Display statistics
console.log(`${colors.yellow}Total Prompts: ${stats.total}${colors.reset}`);
console.log(`${colors.red}Missing 'tips' field: ${stats.missingTips} (${((stats.missingTips/stats.total)*100).toFixed(1)}%)${colors.reset}`);
console.log(`${colors.yellow}Empty 'tips' array: ${stats.emptyTips} (${((stats.emptyTips/stats.total)*100).toFixed(1)}%)${colors.reset}`);
console.log(`${colors.red}Missing 'images' field: ${stats.missingImages} (${((stats.missingImages/stats.total)*100).toFixed(1)}%)${colors.reset}`);
console.log(`${colors.yellow}Empty 'images' array: ${stats.emptyImages} (${((stats.emptyImages/stats.total)*100).toFixed(1)}%)${colors.reset}`);
console.log(`${colors.red}Missing 'tags' field: ${stats.missingTags} (${((stats.missingTags/stats.total)*100).toFixed(1)}%)${colors.reset}`);
console.log(`${colors.yellow}Empty 'tags' array: ${stats.emptyTags} (${((stats.emptyTags/stats.total)*100).toFixed(1)}%)${colors.reset}`);
console.log(`${colors.red}Missing 'complexity' field: ${stats.missingComplexity} (${((stats.missingComplexity/stats.total)*100).toFixed(1)}%)${colors.reset}`);
console.log(`${colors.red}Missing 'metadata' object: ${stats.missingMetadata} (${((stats.missingMetadata/stats.total)*100).toFixed(1)}%)${colors.reset}`);
console.log(`${colors.red}Missing 'metadata.whatItDoes': ${stats.missingWhatItDoes} (${((stats.missingWhatItDoes/stats.total)*100).toFixed(1)}%)${colors.reset}`);
console.log(`${colors.red}Missing 'metadata.howToUse': ${stats.missingHowToUse} (${((stats.missingHowToUse/stats.total)*100).toFixed(1)}%)${colors.reset}`);
console.log(`${colors.red}Missing 'metadata.exampleInput': ${stats.missingExampleInput} (${((stats.missingExampleInput/stats.total)*100).toFixed(1)}%)${colors.reset}\n`);

// Determine default complexity based on word count
function getDefaultComplexity(wordCount) {
  if (!wordCount || wordCount < 100) return 'beginner';
  if (wordCount < 300) return 'intermediate';
  return 'advanced';
}

// Create backup before making changes
console.log(`${colors.blue}Creating backup...${colors.reset}`);
fs.writeFileSync(BACKUP_PATH, JSON.stringify(data, null, 2));
console.log(`${colors.green}✓ Backup created: ${BACKUP_PATH}${colors.reset}\n`);

// Fix all prompts
console.log(`${colors.bold}${colors.magenta}POPULATING MISSING FIELDS:${colors.reset}`);

let fixCount = 0;

data.prompts.forEach(prompt => {
  let fixed = false;

  // Ensure tips exists (at least empty array)
  if (!prompt.tips) {
    prompt.tips = [];
    fixed = true;
  }

  // Ensure images exists (at least empty array)
  if (!prompt.images) {
    prompt.images = [];
    fixed = true;
  }

  // Ensure tags exists (at least empty array)
  if (!prompt.tags) {
    prompt.tags = [];
    fixed = true;
  }

  // Ensure complexity exists
  if (!prompt.complexity) {
    prompt.complexity = getDefaultComplexity(prompt.word_count);
    fixed = true;
  }

  // Ensure metadata object exists
  if (!prompt.metadata) {
    prompt.metadata = {
      whatItDoes: `This ${prompt.department} prompt helps you ${prompt.title?.toLowerCase() || 'achieve your goals'}.`,
      howToUse: `1. Read the prompt carefully\n2. Replace any placeholders with your specific information\n3. Submit to your AI assistant\n4. Review and refine the output as needed`,
      exampleInput: `Use this prompt when you need assistance with ${prompt.subcategory || prompt.department} tasks.`
    };
    fixed = true;
  } else {
    // Ensure individual metadata fields exist
    if (!prompt.metadata.whatItDoes) {
      prompt.metadata.whatItDoes = `This ${prompt.department} prompt helps you ${prompt.title?.toLowerCase() || 'achieve your goals'}.`;
      fixed = true;
    }
    if (!prompt.metadata.howToUse) {
      prompt.metadata.howToUse = `1. Read the prompt carefully\n2. Replace any placeholders with your specific information\n3. Submit to your AI assistant\n4. Review and refine the output as needed`;
      fixed = true;
    }
    if (!prompt.metadata.exampleInput) {
      prompt.metadata.exampleInput = `Use this prompt when you need assistance with ${prompt.subcategory || prompt.department} tasks.`;
      fixed = true;
    }
  }

  if (fixed) {
    fixCount++;
  }
});

console.log(`${colors.green}✓ Fixed ${fixCount} prompts with missing fields${colors.reset}\n`);

// Write updated data
console.log(`${colors.blue}Writing updated prompts index...${colors.reset}`);
fs.writeFileSync(PROMPTS_INDEX_PATH, JSON.stringify(data, null, 2));
console.log(`${colors.green}✓ Successfully updated prompts_index.json${colors.reset}\n`);

// Verify all prompts now have complete metadata
console.log(`${colors.bold}${colors.yellow}VERIFICATION:${colors.reset}`);

let allComplete = true;
const verifyStats = {
  total: data.prompts.length,
  withTips: 0,
  withImages: 0,
  withTags: 0,
  withComplexity: 0,
  withMetadata: 0,
  withWhatItDoes: 0,
  withHowToUse: 0,
  withExampleInput: 0
};

data.prompts.forEach(prompt => {
  if (prompt.tips) verifyStats.withTips++;
  if (prompt.images) verifyStats.withImages++;
  if (prompt.tags) verifyStats.withTags++;
  if (prompt.complexity) verifyStats.withComplexity++;
  if (prompt.metadata) verifyStats.withMetadata++;
  if (prompt.metadata?.whatItDoes) verifyStats.withWhatItDoes++;
  if (prompt.metadata?.howToUse) verifyStats.withHowToUse++;
  if (prompt.metadata?.exampleInput) verifyStats.withExampleInput++;

  // Check if any field is missing
  if (!prompt.tips || !prompt.images || !prompt.tags || !prompt.complexity ||
      !prompt.metadata || !prompt.metadata.whatItDoes ||
      !prompt.metadata.howToUse || !prompt.metadata.exampleInput) {
    allComplete = false;
  }
});

console.log(`${colors.green}Prompts with 'tips': ${verifyStats.withTips}/${verifyStats.total} (${((verifyStats.withTips/verifyStats.total)*100).toFixed(1)}%)${colors.reset}`);
console.log(`${colors.green}Prompts with 'images': ${verifyStats.withImages}/${verifyStats.total} (${((verifyStats.withImages/verifyStats.total)*100).toFixed(1)}%)${colors.reset}`);
console.log(`${colors.green}Prompts with 'tags': ${verifyStats.withTags}/${verifyStats.total} (${((verifyStats.withTags/verifyStats.total)*100).toFixed(1)}%)${colors.reset}`);
console.log(`${colors.green}Prompts with 'complexity': ${verifyStats.withComplexity}/${verifyStats.total} (${((verifyStats.withComplexity/verifyStats.total)*100).toFixed(1)}%)${colors.reset}`);
console.log(`${colors.green}Prompts with 'metadata': ${verifyStats.withMetadata}/${verifyStats.total} (${((verifyStats.withMetadata/verifyStats.total)*100).toFixed(1)}%)${colors.reset}`);
console.log(`${colors.green}Prompts with 'metadata.whatItDoes': ${verifyStats.withWhatItDoes}/${verifyStats.total} (${((verifyStats.withWhatItDoes/verifyStats.total)*100).toFixed(1)}%)${colors.reset}`);
console.log(`${colors.green}Prompts with 'metadata.howToUse': ${verifyStats.withHowToUse}/${verifyStats.total} (${((verifyStats.withHowToUse/verifyStats.total)*100).toFixed(1)}%)${colors.reset}`);
console.log(`${colors.green}Prompts with 'metadata.exampleInput': ${verifyStats.withExampleInput}/${verifyStats.total} (${((verifyStats.withExampleInput/verifyStats.total)*100).toFixed(1)}%)${colors.reset}\n`);

if (allComplete) {
  console.log(`${colors.bold}${colors.green}✓✓✓ SUCCESS! ALL ${verifyStats.total} PROMPTS NOW HAVE COMPLETE METADATA ✓✓✓${colors.reset}\n`);
} else {
  console.log(`${colors.bold}${colors.red}✗ WARNING: Some prompts still have missing fields${colors.reset}\n`);
}

console.log(`${colors.bold}${colors.cyan}========================================${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}METADATA COMPLETION SUMMARY${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}========================================${colors.reset}`);
console.log(`${colors.yellow}Total Prompts: ${verifyStats.total}${colors.reset}`);
console.log(`${colors.green}Prompts Fixed: ${fixCount}${colors.reset}`);
console.log(`${colors.green}All Fields Complete: ${allComplete ? 'YES' : 'NO'}${colors.reset}`);
console.log(`${colors.blue}Backup Location: ${BACKUP_PATH}${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}========================================${colors.reset}\n`);
