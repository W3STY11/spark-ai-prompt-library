#!/usr/bin/env node
/**
 * Match images from Notion export folders to current prompts by EXACT title matching
 * and upload to Azure Blob Storage
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NOTION_EXPORT = '/home/aiwithnick/AI Prompts v5';
const THUMBNAILS_DIR = path.join(__dirname, '..', 'public', 'thumbnails');
const INDEX_PATH = path.join(__dirname, '..', 'public', 'prompts_index.json');

async function main() {
  console.log('🔍 Matching images from Notion export to current prompts...\n');

  // Load the current index
  const indexData = JSON.parse(await fs.readFile(INDEX_PATH, 'utf-8'));
  console.log(`✓ Loaded index: ${indexData.prompts.length} prompts\n`);

  // Ensure thumbnails directory exists
  await fs.mkdir(THUMBNAILS_DIR, { recursive: true });

  let processedCount = 0;
  let imageCount = 0;
  let notFoundCount = 0;

  for (const prompt of indexData.prompts) {
    // Search for folder with exact title match
    try {
      const { stdout } = await execAsync(`find "${NOTION_EXPORT}" -type d -name "${prompt.title}" 2>/dev/null | head -1`);
      const promptDir = stdout.trim();

      if (!promptDir) {
        notFoundCount++;
        continue;
      }

      // Find all PNG images in this prompt's directory (excluding any icon files)
      try {
        const files = await fs.readdir(promptDir);
        const pngFiles = files
          .filter(f => f.endsWith('.png'))
          .filter(f => !f.toLowerCase().includes('icon'))
          .sort();  // Sort to ensure consistent ordering

        if (pngFiles.length > 0) {
          for (let i = 0; i < pngFiles.length; i++) {
            const sourcePath = path.join(promptDir, pngFiles[i]);
            const destFilename = `${prompt.id}_image_${i + 1}.png`;
            const destPath = path.join(THUMBNAILS_DIR, destFilename);

            await fs.copyFile(sourcePath, destPath);
            imageCount++;
          }

          processedCount++;
          if (processedCount % 100 === 0) {
            console.log(`  Progress: ${processedCount} prompts processed, ${imageCount} images copied`);
          }
        }
      } catch (err) {
        // Directory might not have images or be readable
      }
    } catch (err) {
      // Couldn't find folder for this prompt
      notFoundCount++;
    }
  }

  console.log(`\n✅ Processing complete:`);
  console.log(`   Prompts with images: ${processedCount}`);
  console.log(`   Total images copied: ${imageCount}`);
  console.log(`   Prompts not found in export: ${notFoundCount}\n`);

  if (imageCount === 0) {
    console.log('❌ No images were copied. Check that the Notion export path is correct.');
    process.exit(1);
  }

  console.log('📤 Uploading images to Azure Blob Storage...\n');

  // Ensure thumbnails container exists with public access
  try {
    await execAsync('az storage container create --name thumbnails --account-name sparkpromptstorage --public-access blob 2>/dev/null');
    console.log('✓ Thumbnails container ready\n');
  } catch (err) {
    // Container already exists
    console.log('✓ Thumbnails container exists\n');
  }

  // Upload all images
  console.log('Uploading images (this may take a few minutes)...');
  await execAsync(`az storage blob upload-batch --source "${THUMBNAILS_DIR}" --destination thumbnails --account-name sparkpromptstorage --pattern "*.png" --overwrite true --output none`);

  console.log(`\n✅ Upload complete! ${imageCount} images now in blob storage`);
  console.log('   Images accessible at: https://sparkpromptstorage.blob.core.windows.net/thumbnails/{filename}');
}

main().catch(console.error);
