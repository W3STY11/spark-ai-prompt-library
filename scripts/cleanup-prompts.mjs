#!/usr/bin/env node
/**
 * AUTO-CLEANUP SCRIPT FOR SPARK PROMPT LIBRARY
 * Automatically fixes:
 * - Leading/trailing whitespace
 * - Word count mismatches
 * - Duplicate tags
 * - Empty arrays vs missing arrays
 */

import fs from 'fs/promises';
import path from 'path';

const stats = {
  total: 0,
  cleaned: 0,
  issues: {
    whitespace: 0,
    wordCount: 0,
    duplicateTags: 0,
    arrayFixes: 0
  }
};

async function cleanupPrompts() {
  console.log('🧹 SPARK Prompt Library - Auto-Cleanup\n');
  console.log('Loading prompts_index.json...');

  const indexPath = path.join(process.cwd(), 'public', 'prompts_index.json');
  const indexData = await fs.readFile(indexPath, 'utf-8');
  const index = JSON.parse(indexData);

  // Create backup first
  const backupPath = path.join(process.cwd(), 'backups', `prompts_backup_before_cleanup_${Date.now()}.json`);
  await fs.mkdir(path.dirname(backupPath), { recursive: true });
  await fs.writeFile(backupPath, indexData);
  console.log(`✓ Backup created: ${path.basename(backupPath)}\n`);

  stats.total = index.prompts.length;
  console.log(`Processing ${stats.total} prompts...\n`);

  // Clean each prompt
  for (let i = 0; i < index.prompts.length; i++) {
    const prompt = index.prompts[i];
    let modified = false;

    // Fix whitespace in text fields
    if (prompt.title && prompt.title !== prompt.title.trim()) {
      prompt.title = prompt.title.trim();
      modified = true;
      stats.issues.whitespace++;
    }

    if (prompt.description && prompt.description !== prompt.description.trim()) {
      prompt.description = prompt.description.trim();
      modified = true;
      stats.issues.whitespace++;
    }

    if (prompt.content && prompt.content !== prompt.content.trim()) {
      prompt.content = prompt.content.trim();
      modified = true;
      stats.issues.whitespace++;
    }

    if (prompt.subcategory && prompt.subcategory !== prompt.subcategory.trim()) {
      prompt.subcategory = prompt.subcategory.trim();
      modified = true;
      stats.issues.whitespace++;
    }

    // Fix word count if content exists
    if (prompt.content && prompt.content.trim().length > 0) {
      const actualWordCount = prompt.content.split(/\s+/).filter(word => word.length > 0).length;
      if (prompt.word_count !== actualWordCount) {
        prompt.word_count = actualWordCount;
        modified = true;
        stats.issues.wordCount++;
      }
    }

    // Remove duplicate tags
    if (Array.isArray(prompt.tags) && prompt.tags.length > 0) {
      const uniqueTags = [...new Set(prompt.tags)];
      if (uniqueTags.length !== prompt.tags.length) {
        prompt.tags = uniqueTags;
        modified = true;
        stats.issues.duplicateTags++;
      }
    }

    // Ensure arrays are proper arrays (not undefined/null)
    if (!Array.isArray(prompt.tags)) {
      prompt.tags = [];
      modified = true;
      stats.issues.arrayFixes++;
    }

    if (!Array.isArray(prompt.images)) {
      prompt.images = [];
      modified = true;
      stats.issues.arrayFixes++;
    }

    if (!Array.isArray(prompt.tips)) {
      prompt.tips = [];
      modified = true;
      stats.issues.arrayFixes++;
    }

    if (modified) {
      stats.cleaned++;
    }

    // Progress indicator
    if ((i + 1) % 100 === 0) {
      process.stdout.write(`\rProcessed: ${i + 1}/${stats.total}`);
    }
  }

  console.log(`\rProcessed: ${stats.total}/${stats.total} ✓\n`);

  // Write cleaned data
  await fs.writeFile(indexPath, JSON.stringify(index, null, 2));
  console.log('✅ Cleaned data saved to prompts_index.json\n');

  // Report
  console.log('='.repeat(60));
  console.log('📊 CLEANUP REPORT');
  console.log('='.repeat(60) + '\n');
  console.log(`Total Prompts: ${stats.total}`);
  console.log(`Prompts Modified: ${stats.cleaned}`);
  console.log(`Success Rate: ${((stats.cleaned / stats.total) * 100).toFixed(2)}%\n`);
  console.log('Issues Fixed:');
  console.log(`  • Whitespace cleaned: ${stats.issues.whitespace}`);
  console.log(`  • Word counts fixed: ${stats.issues.wordCount}`);
  console.log(`  • Duplicate tags removed: ${stats.issues.duplicateTags}`);
  console.log(`  • Arrays normalized: ${stats.issues.arrayFixes}`);
  console.log('\n' + '='.repeat(60));
  console.log('✅ Cleanup complete!');
  console.log('='.repeat(60) + '\n');
}

cleanupPrompts().catch(console.error);
