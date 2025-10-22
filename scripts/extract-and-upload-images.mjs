#!/usr/bin/env node
/**
 * Extract images from Notion export and upload to Azure Blob Storage
 * Matches images to current prompt IDs
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import crypto from 'crypto';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NOTION_EXPORT = '/home/aiwithnick/AI Prompts v5';
const THUMBNAILS_DIR = path.join(__dirname, '..', 'public', 'thumbnails');
const INDEX_PATH = path.join(__dirname, '..', 'public', 'prompts_index.json');

// Generate MD5 hash for prompt ID
function generateId(filePath) {
  return crypto.createHash('md5').update(filePath).digest('hex');
}

async function main() {
  console.log('🔍 Extracting and processing images from Notion export...\n');

  // Load the current index
  const indexData = JSON.parse(await fs.readFile(INDEX_PATH, 'utf-8'));
  console.log(`✓ Loaded index: ${indexData.prompts.length} prompts\n`);

  // Create backup
  const backupPath = INDEX_PATH.replace('.json', `_backup_before_images_${Date.now()}.json`);
  await fs.writeFile(backupPath, JSON.stringify(indexData, null, 2));
  console.log(`✓ Backup created\n`);

  // Clear thumbnails directory
  try {
    const existing = await fs.readdir(THUMBNAILS_DIR);
    for (const file of existing) {
      await fs.unlink(path.join(THUMBNAILS_DIR, file));
    }
    console.log(`✓ Cleared ${existing.length} old files from thumbnails\n`);
  } catch (err) {
    // Directory might not exist yet
  }

  // Ensure thumbnails directory exists
  await fs.mkdir(THUMBNAILS_DIR, { recursive: true });

  // Process each prompt
  let processedCount = 0;
  let imageCount = 0;

  for (const prompt of indexData.prompts) {
    // Find the HTML file for this prompt in the Notion export
    const htmlPattern = `${prompt.title.replace(/[^a-zA-Z0-9 ]/g, '')}*.html`;

    try {
      const { stdout } = await execAsync(`find "${NOTION_EXPORT}" -name "${prompt.title.replace(/[^a-zA-Z0-9 ]/g, '')}*.html" | head -1`);
      const htmlPath = stdout.trim();

      if (!htmlPath) continue;

      const promptDir = path.dirname(htmlPath);

      // Find all PNG images in this prompt's directory
      try {
        const files = await fs.readdir(promptDir);
        const pngFiles = files.filter(f => f.endsWith('.png') && !f.includes('icon'));

        if (pngFiles.length > 0) {
          prompt.images = [];

          for (let i = 0; i < pngFiles.length; i++) {
            const sourcePath = path.join(promptDir, pngFiles[i]);
            const destFilename = `${prompt.id}_image_${i + 1}.png`;
            const destPath = path.join(THUMBNAILS_DIR, destFilename);

            await fs.copyFile(sourcePath, destPath);
            prompt.images.push(destFilename);
            imageCount++;
          }

          processedCount++;
        }
      } catch (err) {
        // Directory might not have images
      }
    } catch (err) {
      // Couldn't find HTML file for this prompt
    }
  }

  console.log(`✓ Processed ${processedCount} prompts`);
  console.log(`✓ Extracted ${imageCount} images\n`);

  // Save updated index
  await fs.writeFile(INDEX_PATH, JSON.stringify(indexData, null, 2));
  console.log(`✅ Updated index saved\n`);

  console.log('📤 Uploading to Azure Blob Storage...\n');

  // Create thumbnails container with public access
  try {
    await execAsync('az storage container create --name thumbnails --account-name sparkpromptstorage --public-access blob');
    console.log('✓ Created thumbnails container\n');
  } catch (err) {
    console.log('✓ Thumbnails container already exists\n');
  }

  // Upload images
  await execAsync(`az storage blob upload-batch --source "${THUMBNAILS_DIR}" --destination thumbnails --account-name sparkpromptstorage --pattern "*.png" --overwrite`);
  console.log('✓ Images uploaded to blob storage\n');

  // Upload updated JSON
  await execAsync(`az storage blob upload --account-name sparkpromptstorage --container-name data --name prompts_index.json --file "${INDEX_PATH}" --overwrite`);
  console.log('✓ Updated JSON uploaded\n');

  console.log('✅ Done! Images are now accessible at:');
  console.log('   https://sparkpromptstorage.blob.core.windows.net/thumbnails/{filename}');
}

main().catch(console.error);
