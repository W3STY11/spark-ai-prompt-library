import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

async function uploadIndexedImages() {
  console.log('📖 Reading prompts_index.json...');

  const indexPath = './public/prompts_index.json';
  const indexData = JSON.parse(await fs.readFile(indexPath, 'utf-8'));

  // Collect all unique image filenames from the index
  const imageFiles = new Set();

  for (const prompt of indexData.prompts) {
    if (prompt.images && Array.isArray(prompt.images)) {
      for (const img of prompt.images) {
        imageFiles.add(img);
      }
    }
  }

  console.log(`\n📸 Found ${imageFiles.size} unique images referenced in index`);

  // Check which files actually exist locally
  const thumbnailsDir = './public/thumbnails';
  const existingFiles = [];
  const missingFiles = [];

  for (const filename of imageFiles) {
    const filePath = path.join(thumbnailsDir, filename);
    try {
      await fs.access(filePath);
      existingFiles.push(filename);
    } catch {
      missingFiles.push(filename);
    }
  }

  console.log(`✅ ${existingFiles.length} images exist locally`);
  console.log(`❌ ${missingFiles.length} images missing locally`);

  if (missingFiles.length > 0) {
    console.log('\n⚠️  Missing images (first 10):');
    missingFiles.slice(0, 10).forEach(f => console.log(`   - ${f}`));
  }

  if (existingFiles.length === 0) {
    console.log('\n❌ No images to upload!');
    return;
  }

  // Upload existing files to blob storage
  console.log(`\n📤 Uploading ${existingFiles.length} images to Azure Blob Storage...`);

  for (let i = 0; i < existingFiles.length; i++) {
    const filename = existingFiles[i];
    const filePath = path.join(thumbnailsDir, filename);

    try {
      await execAsync(`az storage blob upload \\
        --account-name sparkpromptstorage \\
        --container-name thumbnails \\
        --name "${filename}" \\
        --file "${filePath}" \\
        --overwrite true \\
        --no-progress 2>/dev/null`);

      if ((i + 1) % 50 === 0) {
        console.log(`   Uploaded ${i + 1}/${existingFiles.length}...`);
      }
    } catch (err) {
      console.error(`   ❌ Failed to upload ${filename}: ${err.message}`);
    }
  }

  console.log(`\n✅ Upload complete! ${existingFiles.length} images uploaded.`);
}

uploadIndexedImages().catch(console.error);
