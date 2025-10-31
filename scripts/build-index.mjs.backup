#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SOURCE_ROOT = '/home/aiwithnick/AI Prompts v5_BACKUP';
const PUBLIC_DIR = path.join(ROOT, 'public');
const PROMPTS_DIR = path.join(PUBLIC_DIR, 'prompts');
const THUMBNAILS_DIR = path.join(PUBLIC_DIR, 'thumbnails');
const INDEX_FILE = path.join(PUBLIC_DIR, 'prompts_index.json');

// Department configurations
const DEPARTMENTS = [
  { folder: 'AI Prompts for Business', name: 'Business', icon: '💼', color: '#3b82f6' },
  { folder: 'AI Prompts for Marketing', name: 'Marketing', icon: '📢', color: '#ec4899' },
  { folder: 'AI Prompts for Sales', name: 'Sales', icon: '💰', color: '#10b981' },
  { folder: 'AI Prompts for SEO', name: 'SEO', icon: '🔍', color: '#8b5cf6' },
  { folder: 'AI Prompts for Finance', name: 'Finance', icon: '💵', color: '#f59e0b' },
  { folder: 'AI Prompts for Education', name: 'Education', icon: '📚', color: '#06b6d4' },
  { folder: 'AI Prompts for Writing', name: 'Writing', icon: '✍️', color: '#ef4444' },
  { folder: 'AI Prompts for Productivity', name: 'Productivity', icon: '⚡', color: '#f97316' },
  { folder: 'AI Prompts for Solopreneurs', name: 'Solopreneurs', icon: '🚀', color: '#a855f7' }
];

console.log('🚀 Building Prompt Library Index (Version 3)...\n');
console.log(`📂 Source: ${SOURCE_ROOT}`);
console.log(`📦 Output: ${PUBLIC_DIR}\n`);

// Ensure output directories exist
await fs.mkdir(PROMPTS_DIR, { recursive: true });
await fs.mkdir(THUMBNAILS_DIR, { recursive: true });

const index = {
  meta: {
    version: '3.0.0',
    last_updated: new Date().toISOString(),
    total_prompts: 0,
    departments: DEPARTMENTS.length
  },
  departments: [],
  prompts: []
};

const startTime = Date.now();
let totalFiles = 0;
let processedFiles = 0;
let totalWithImages = 0;

// Process each department
for (const dept of DEPARTMENTS) {
  const deptPath = path.join(SOURCE_ROOT, dept.folder);

  try {
    await fs.access(deptPath);
  } catch {
    console.log(`⚠️  Department not found: ${dept.name}`);
    continue;
  }

  const files = await fs.readdir(deptPath);
  const htmlFiles = files.filter(f => f.endsWith('.html'));
  totalFiles += htmlFiles.length;

  console.log(`📁 Processing ${dept.name}: ${htmlFiles.length} prompts`);

  const deptPrompts = [];

  for (const file of htmlFiles) {
    const filePath = path.join(deptPath, file);
    const content = await fs.readFile(filePath, 'utf-8');
    const $ = cheerio.load(content);

    // Extract prompt data
    const title = $('h1').first().text().trim() ||
                  $('.page-title').first().text().trim() ||
                  file.replace(/\s+[a-f0-9]{32}\.html$/, '');

    const subcategory = $('mark[class*="color"]').first().text().trim();
    const icon = $('h1 span').first().text().trim() || dept.icon;

    // Extract description from callout
    const description = $('.callout').first().text().trim().substring(0, 200);

    // Extract main prompt content
    let promptContent = '';
    $('pre code').each((i, elem) => {
      const text = $(elem).text().trim();
      if (text.length > promptContent.length) {
        promptContent = text;
      }
    });

    // Extract tips
    const tips = [];
    $('ul li').each((i, elem) => {
      const tip = $(elem).text().trim();
      if (tip && tip.length > 10 && tip.length < 500) {
        tips.push(tip);
      }
    });

    // Extract date
    const dateMatch = content.match(/\d{4}-\d{2}-\d{2}/);
    const date = dateMatch ? dateMatch[0] : new Date().toISOString().split('T')[0];

    // Generate unique ID
    const id = crypto.createHash('md5').update(filePath).digest('hex');

    // Find associated images
    const folderName = file.replace('.html', '');
    const imageFolderPath = path.join(deptPath, folderName);
    const images = [];

    try {
      const imageFiles = await fs.readdir(imageFolderPath);
      const pngFiles = imageFiles.filter(f => f.toLowerCase().endsWith('.png'));

      for (const imgFile of pngFiles) {
        const srcPath = path.join(imageFolderPath, imgFile);
        const destPath = path.join(THUMBNAILS_DIR, `${id}_${imgFile}`);
        await fs.copyFile(srcPath, destPath);
        images.push(`${id}_${imgFile}`);
      }

      if (pngFiles.length > 0) totalWithImages++;
    } catch {
      // No images folder
    }

    // Copy HTML file
    const destHtmlPath = path.join(PROMPTS_DIR, `${id}.html`);
    await fs.copyFile(filePath, destHtmlPath);

    // Extract tags from content
    const tags = [];
    const contentLower = (title + ' ' + description + ' ' + subcategory).toLowerCase();
    const commonTags = [
      'strategy', 'analysis', 'planning', 'research', 'communication',
      'marketing', 'sales', 'seo', 'content', 'social media',
      'finance', 'budget', 'analytics', 'reporting', 'email',
      'writing', 'copywriting', 'education', 'training', 'productivity',
      'automation', 'management', 'leadership', 'startup', 'growth'
    ];

    for (const tag of commonTags) {
      if (contentLower.includes(tag)) {
        tags.push(tag);
      }
    }

    const prompt = {
      id,
      title,
      department: dept.name,
      subcategory,
      description,
      content: promptContent,
      date,
      icon,
      tips: tips.slice(0, 5),
      images,
      tags: [...new Set(tags)].slice(0, 5),
      word_count: promptContent.split(/\s+/).length,
      complexity: promptContent.length < 500 ? 'beginner' :
                  promptContent.length < 1500 ? 'intermediate' : 'advanced'
    };

    deptPrompts.push(prompt);
    index.prompts.push(prompt);
    processedFiles++;

    if (processedFiles % 100 === 0) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`   Processed ${processedFiles}/${totalFiles} (${elapsed}s)`);
    }
  }

  // Add department summary
  index.departments.push({
    name: dept.name,
    icon: dept.icon,
    color: dept.color,
    count: deptPrompts.length,
    description: `${deptPrompts.length} professional ${dept.name.toLowerCase()} prompts`,
    prompts_with_images: deptPrompts.filter(p => p.images.length > 0).length
  });
}

index.meta.total_prompts = index.prompts.length;

// Write index file
await fs.writeFile(INDEX_FILE, JSON.stringify(index, null, 2));

const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

console.log(`\n✅ Index built successfully!\n`);
console.log(`📊 Summary:`);
console.log(`   Total prompts: ${index.meta.total_prompts}`);
console.log(`   With images: ${totalWithImages}`);
console.log(`   Without images: ${index.meta.total_prompts - totalWithImages}`);
console.log(`   Departments: ${index.meta.departments}`);
console.log(`   Build time: ${elapsed}s\n`);

console.log(`📋 Prompts by department:`);
for (const dept of index.departments) {
  console.log(`   ${dept.icon} ${dept.name}: ${dept.count} (${dept.prompts_with_images} with images)`);
}

console.log(`\n💾 Index written to: ${INDEX_FILE}`);
console.log(`📁 Files copied to: ${PROMPTS_DIR}`);
console.log(`🖼️  Thumbnails in: ${THUMBNAILS_DIR}\n`);
