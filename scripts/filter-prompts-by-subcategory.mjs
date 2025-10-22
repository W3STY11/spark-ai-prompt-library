#!/usr/bin/env node
/**
 * Filter prompts to only include approved subcategories
 * Reduces from 2,535 to ~1,600 prompts as per boss requirements
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_PATH = path.join(__dirname, '..', 'public', 'prompts_index.json');
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'prompts_index.json');
const BACKUP_PATH = path.join(__dirname, '..', 'backups', `prompts_backup_before_filter_${Date.now()}.json`);

// Approved subcategories by department (from boss)
const APPROVED_SUBCATEGORIES = {
  'Business': [
    'Analytics & Research',
    'Business Automation',
    'Business Communications',
    'Business Development',
    'Business Management',
    'Business Operations',
    'Business Strategy',
    'Innovation & Growth',
    'Risk Management'
  ],
  'Education': [
    'Data Analytics',
    'Learning Strategies',
    'Professional Development'
  ],
  'Finance': [
    'Cash Flow Forecasting'
  ],
  'Marketing': [
    'Branding',
    'Content Marketing',
    'Email Marketing',
    'Influencer Marketing',
    'Lead Generation',
    'Market Research',
    'Marketing Automation',
    'Marketing Strategy',
    'Online Marketing'
  ],
  'Productivity': [
    'Goal Setting & Tracking',
    'Personal Development',
    'Remote Work',
    'Stress Management',
    'Task Management',
    'Time Management'
  ],
  'Sales': [
    'Customer Engagement',
    'Lead Generation',
    'Marketing Research',
    'Partnership & Incentives',
    'Proposal Development',
    'Sales Process Management'
  ],
  'SEO': [
    'Local SEO',
    'Off-Page SEO',
    'On-Page SEO',
    'Programmatic SEO',
    'SEO Analysis',
    'SEO Basics',
    'Technical SEO'
  ],
  'Writing': [
    'Copywriting',
    'Creative Writing',
    'Legal Writing',
    'Persona-based Writing',
    'Proofreading',
    'Technical Writing'
  ]
};

async function filterPrompts() {
  console.log('🔍 Filtering prompts by approved subcategories...\n');

  // Load data
  const data = JSON.parse(await fs.readFile(INPUT_PATH, 'utf-8'));
  console.log(`Loaded ${data.prompts.length} total prompts\n`);

  // Create backup
  await fs.mkdir(path.dirname(BACKUP_PATH), { recursive: true });
  await fs.writeFile(BACKUP_PATH, JSON.stringify(data, null, 2));
  console.log(`✓ Backup created: ${path.basename(BACKUP_PATH)}\n`);

  // Filter prompts
  const filteredPrompts = data.prompts.filter(prompt => {
    const dept = prompt.department;
    const subcat = prompt.subcategory;

    if (!APPROVED_SUBCATEGORIES[dept]) {
      return false; // Department not approved
    }

    if (!APPROVED_SUBCATEGORIES[dept].includes(subcat)) {
      return false; // Subcategory not approved
    }

    return true;
  });

  console.log(`✓ Filtered to ${filteredPrompts.length} prompts\n`);

  // Update department counts
  const deptStats = {};
  filteredPrompts.forEach(p => {
    if (!deptStats[p.department]) {
      deptStats[p.department] = {
        name: p.department,
        icon: p.icon,
        count: 0
      };
    }
    deptStats[p.department].count++;
  });

  // Build filtered index
  const filteredData = {
    meta: {
      version: '4.1.0',
      total_prompts: filteredPrompts.length,
      last_updated: new Date().toISOString(),
      source: 'Notion API - Filtered by Approved Subcategories'
    },
    departments: Object.values(deptStats),
    prompts: filteredPrompts
  };

  // Save
  await fs.writeFile(OUTPUT_PATH, JSON.stringify(filteredData, null, 2));
  console.log(`✓ Saved filtered data to: ${OUTPUT_PATH}\n`);

  // Print summary
  console.log('='.repeat(60));
  console.log('📊 FILTER SUMMARY');
  console.log('='.repeat(60));
  console.log(`Original prompts: ${data.prompts.length}`);
  console.log(`Filtered prompts: ${filteredPrompts.length}`);
  console.log(`Removed: ${data.prompts.length - filteredPrompts.length}`);
  console.log('\nBy Department:');
  Object.values(deptStats).forEach(d => {
    console.log(`  ${d.icon} ${d.name}: ${d.count}`);
  });
  console.log('='.repeat(60));
}

filterPrompts().catch(console.error);
