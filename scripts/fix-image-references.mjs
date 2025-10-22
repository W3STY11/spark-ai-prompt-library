#!/usr/bin/env node
/**
 * Fix image references in prompts_index.json to match actual blob storage filenames
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const THUMBNAILS_DIR = path.join(__dirname, '..', 'public', 'thumbnails');
const INDEX_PATH = path.join(__dirname, '..', 'public', 'prompts_index.json');

async function main() {
  console.log('🔧 Fixing image references in prompts_index.json...\n');

  // Load the index
  const indexData = JSON.parse(await fs.readFile(INDEX_PATH, 'utf-8'));
  console.log(`✓ Loaded index: ${indexData.prompts.length} prompts\n`);

  // Create backup
  const backupPath = INDEX_PATH.replace('.json', `_backup_before_image_fix_${Date.now()}.json`);
  await fs.writeFile(backupPath, JSON.stringify(indexData, null, 2));
  console.log(`✓ Backup created: ${path.basename(backupPath)}\n`);

  // Get all thumbnail filenames
  const thumbnailFiles = await fs.readdir(THUMBNAILS_DIR);
  const pngFiles = thumbnailFiles.filter(f => f.endsWith('.png'));
  console.log(`✓ Found ${pngFiles.length} PNG files in thumbnails directory\n`);

  // Create a map of prompt ID to image filenames
  const imageMap = new Map();
  for (const filename of pngFiles) {
    // Extract prompt ID (first 32 chars = MD5 hash)
    const promptId = filename.substring(0, 32);
    if (!imageMap.has(promptId)) {
      imageMap.set(promptId, []);
    }
    imageMap.get(promptId).push(filename);
  }

  console.log(`✓ Found images for ${imageMap.size} unique prompt IDs\n`);

  // Update prompts with correct image references
  let updated = 0;
  for (const prompt of indexData.prompts) {
    if (imageMap.has(prompt.id)) {
      const images = imageMap.get(prompt.id).sort();
      prompt.images = images;
      updated++;
    }
  }

  console.log(`✓ Updated ${updated} prompts with image references\n`);

  // Save updated index
  await fs.writeFile(INDEX_PATH, JSON.stringify(indexData, null, 2));
  console.log(`✅ Updated index saved to: ${INDEX_PATH}\n`);

  // Show sample
  const sampleWithImages = indexData.prompts.find(p => p.images && p.images.length > 0);
  if (sampleWithImages) {
    console.log('📋 Sample prompt with images:');
    console.log(`   Title: ${sampleWithImages.title}`);
    console.log(`   ID: ${sampleWithImages.id}`);
    console.log(`   Images: ${sampleWithImages.images.join(', ')}\n`);
  }

  console.log('✅ Done!');
}

main().catch(console.error);
