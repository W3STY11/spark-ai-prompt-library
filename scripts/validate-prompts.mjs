#!/usr/bin/env node
/**
 * COMPREHENSIVE PROMPT VALIDATION SCRIPT
 * Validates all 2,530 prompts for:
 * - Field completeness
 * - Data quality
 * - Formatting & cleanliness
 * - Structural integrity
 */

import fs from 'fs/promises';
import path from 'path';

// Known valid values
const VALID_DEPARTMENTS = [
  'Business', 'Marketing', 'SEO', 'Sales', 'Finance',
  'Education', 'Writing', 'Productivity', 'Solopreneurs'
];

const VALID_SUBCATEGORIES = {
  'Business': [
    'Business Strategy', 'Business Development', 'Business Management',
    'Business Communications', 'Analytics & Research', 'Innovation & Growth',
    'Business Operations', 'Business Automation', 'Risk Management'
  ],
  'Marketing': [
    'Content Marketing', 'Market Research', 'Branding', 'Online Marketing',
    'Marketing Automation', 'Marketing Strategy', 'Affiliate Marketing',
    'Lead Generation', 'Email Marketing', 'Influencer Marketing'
  ],
  'SEO': [
    'SEO Basics', 'On-Page SEO', 'Off-Page SEO', 'Technical SEO',
    'SEO Analysis', 'Local SEO', 'Programmatic SEO'
  ],
  'Sales': [
    'Sales Process Management', 'Lead Generation', 'Customer Engagement',
    'Proposal Development', 'Marketing Research', 'Partnership & Incentives'
  ],
  'Finance': [
    'Investing', 'Personal Finance', 'Budgeting & Savings', 'Tax Planning',
    'Small Business Finance', 'Cash Flow Forecasting', 'Funding & Grants'
  ],
  'Education': [
    'Academic Research', 'Studying', 'Home-schooling', 'Teaching',
    'Professional Development', 'Learning Strategies', 'Data Analytics'
  ],
  'Productivity': [
    'Goal Setting & Tracking', 'Personal Development', 'Remote Work',
    'Stress Management', 'Task Management', 'Time Management', 'Meal Planning'
  ],
  'Solopreneurs': [
    'Marketing Funnel', 'Content Creation', 'Business Creation',
    'Customer Support', 'Brand & Audience Building', 'Product Development',
    'Operations & Growth', 'Generate Course Ideas', 'Online Course Creation'
  ],
  'Writing': [
    'Persona-based Writing', 'Academic Writing', 'Legal Writing',
    'Creative Writing', 'Copywriting', 'Technical Writing', 'Journalism',
    'Content Writing', 'General Writing', 'Proofreading', 'Blog Articles',
    'Pitch Writing', 'Rewriting Content'
  ]
};

const DEPARTMENT_EMOJIS = {
  'Business': '💼',
  'Marketing': '📢',
  'Sales': '💰',
  'SEO': '🔍',
  'Finance': '💵',
  'Education': '📚',
  'Writing': '✍️',
  'Productivity': '⚡',
  'Solopreneurs': '🚀'
};

// Validation results
const results = {
  total: 0,
  valid: 0,
  issues: [],
  stats: {
    missingFields: [],
    emptyFields: [],
    invalidValues: [],
    formattingIssues: [],
    dataQuality: [],
    warnings: []
  }
};

// Validation functions
function validateRequiredFields(prompt, index) {
  const required = [
    'id', 'title', 'icon', 'description', 'department',
    'subcategory', 'tags', 'content', 'word_count',
    'date', 'images', 'tips'
  ];

  const missing = [];
  for (const field of required) {
    if (!(field in prompt)) {
      missing.push(field);
    }
  }

  if (missing.length > 0) {
    results.stats.missingFields.push({
      index,
      id: prompt.id || 'unknown',
      title: prompt.title || 'unknown',
      missing
    });
    return false;
  }
  return true;
}

function validateFieldQuality(prompt, index) {
  const issues = [];

  // Check for empty strings (except arrays and numbers)
  if (!prompt.id || prompt.id.trim() === '') {
    issues.push('Empty id');
  }
  if (!prompt.title || prompt.title.trim() === '') {
    issues.push('Empty title');
  }
  if (!prompt.description || prompt.description.trim() === '') {
    issues.push('Empty description');
  }
  if (!prompt.content || prompt.content.trim() === '') {
    issues.push('Empty content');
  }
  if (!prompt.department || prompt.department.trim() === '') {
    issues.push('Empty department');
  }
  if (!prompt.icon || prompt.icon.trim() === '') {
    issues.push('Empty icon');
  }

  // Check arrays
  if (!Array.isArray(prompt.tags)) {
    issues.push('tags is not an array');
  }

  if (!Array.isArray(prompt.images)) {
    issues.push('images is not an array');
  }

  if (!Array.isArray(prompt.tips)) {
    issues.push('tips is not an array');
  }

  // Check word count
  if (typeof prompt.word_count !== 'number') {
    issues.push('word_count is not a number');
  } else if (prompt.word_count === 0) {
    issues.push('word_count is zero');
  }

  if (issues.length > 0) {
    results.stats.emptyFields.push({
      index,
      id: prompt.id,
      title: prompt.title,
      issues
    });
    return false;
  }
  return true;
}

function validateValues(prompt, index) {
  const issues = [];

  // Validate department
  if (!VALID_DEPARTMENTS.includes(prompt.department)) {
    issues.push(`Invalid department: "${prompt.department}"`);
  }

  // Validate subcategory (can be "Custom" or a valid subcategory)
  if (prompt.subcategory && prompt.subcategory !== 'Custom') {
    const validSubcats = VALID_SUBCATEGORIES[prompt.department] || [];
    if (!validSubcats.includes(prompt.subcategory)) {
      // It's okay if not in the list, might be a custom one
      results.stats.warnings.push({
        index,
        id: prompt.id,
        title: prompt.title,
        warning: `Non-standard subcategory: "${prompt.subcategory}" for ${prompt.department}`
      });
    }
  }

  // Validate icon matches department
  const expectedIcon = DEPARTMENT_EMOJIS[prompt.department];
  if (prompt.icon !== expectedIcon) {
    issues.push(`Icon mismatch: got "${prompt.icon}", expected "${expectedIcon}"`);
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(prompt.date)) {
    issues.push(`Invalid date format: "${prompt.date}" (expected YYYY-MM-DD)`);
  }

  // Validate status (if present)
  if (prompt.status) {
    const validStatuses = ['approved', 'pending', 'rejected'];
    if (!validStatuses.includes(prompt.status)) {
      issues.push(`Invalid status: "${prompt.status}"`);
    }
  }

  if (issues.length > 0) {
    results.stats.invalidValues.push({
      index,
      id: prompt.id,
      title: prompt.title,
      issues
    });
    return false;
  }
  return true;
}

function validateFormatting(prompt, index) {
  const issues = [];

  // Check for HTML artifacts in text fields
  const htmlPattern = /<[^>]+>/;
  if (htmlPattern.test(prompt.title)) {
    issues.push('HTML tags found in title');
  }
  if (htmlPattern.test(prompt.description)) {
    issues.push('HTML tags found in description');
  }

  // Check for Notion markup artifacts
  const notionMarkup = /\[\[.*?\]\]|\{\{.*?\}\}/;
  if (notionMarkup.test(prompt.title)) {
    issues.push('Notion markup in title');
  }
  if (notionMarkup.test(prompt.description)) {
    issues.push('Notion markup in description');
  }

  // Check for excessive whitespace
  if (/\s{3,}/.test(prompt.title)) {
    issues.push('Excessive whitespace in title');
  }
  if (/\s{3,}/.test(prompt.description)) {
    issues.push('Excessive whitespace in description');
  }

  // Check for leading/trailing whitespace
  if (prompt.title !== prompt.title.trim()) {
    issues.push('Leading/trailing whitespace in title');
  }
  if (prompt.description !== prompt.description.trim()) {
    issues.push('Leading/trailing whitespace in description');
  }

  // Check content structure markers
  const contentMarkers = ['#CONTEXT:', '#ROLE:', '#GOAL:', '#RESPONSE GUIDELINES:'];
  const hasMarkers = contentMarkers.some(marker => prompt.content.includes(marker));
  if (!hasMarkers) {
    results.stats.warnings.push({
      index,
      id: prompt.id,
      title: prompt.title,
      warning: 'Content missing standard structure markers'
    });
  }

  if (issues.length > 0) {
    results.stats.formattingIssues.push({
      index,
      id: prompt.id,
      title: prompt.title,
      issues
    });
    return false;
  }
  return true;
}

function validateDataQuality(prompt, index) {
  const issues = [];

  // Validate word count accuracy
  const actualWordCount = prompt.content.split(/\s+/).filter(word => word.length > 0).length;
  const difference = Math.abs(actualWordCount - prompt.word_count);
  const tolerance = Math.ceil(actualWordCount * 0.05); // 5% tolerance

  if (difference > tolerance) {
    issues.push(`Word count mismatch: stored=${prompt.word_count}, actual=${actualWordCount}, diff=${difference}`);
  }

  // Check content length (minimum viable prompt)
  if (prompt.content.length < 100) {
    issues.push(`Content too short: ${prompt.content.length} chars`);
  }

  // Check description length
  if (prompt.description.length < 20) {
    issues.push(`Description too short: ${prompt.description.length} chars`);
  }
  if (prompt.description.length > 500) {
    results.stats.warnings.push({
      index,
      id: prompt.id,
      title: prompt.title,
      warning: `Description very long: ${prompt.description.length} chars`
    });
  }

  // Check title length
  if (prompt.title.length < 5) {
    issues.push(`Title too short: ${prompt.title.length} chars`);
  }
  if (prompt.title.length > 100) {
    results.stats.warnings.push({
      index,
      id: prompt.id,
      title: prompt.title,
      warning: `Title very long: ${prompt.title.length} chars`
    });
  }

  // Check for duplicate tags
  const uniqueTags = new Set(prompt.tags);
  if (uniqueTags.size !== prompt.tags.length) {
    issues.push(`Duplicate tags found`);
  }

  if (issues.length > 0) {
    results.stats.dataQuality.push({
      index,
      id: prompt.id,
      title: prompt.title,
      issues
    });
    return false;
  }
  return true;
}

function validatePrompt(prompt, index) {
  let valid = true;

  // Run all validations
  if (!validateRequiredFields(prompt, index)) valid = false;
  if (!validateFieldQuality(prompt, index)) valid = false;
  if (!validateValues(prompt, index)) valid = false;
  if (!validateFormatting(prompt, index)) valid = false;
  if (!validateDataQuality(prompt, index)) valid = false;

  return valid;
}

// Main validation
async function validateAllPrompts() {
  console.log('🔍 SPARK Prompt Library - Comprehensive Validation\n');
  console.log('Loading prompts_index.json...');

  const indexPath = path.join(process.cwd(), 'public', 'prompts_index.json');
  const indexData = await fs.readFile(indexPath, 'utf-8');
  const index = JSON.parse(indexData);

  results.total = index.prompts.length;
  console.log(`✓ Loaded ${results.total} prompts\n`);
  console.log('Running validation tests...\n');

  // Validate each prompt
  for (let i = 0; i < index.prompts.length; i++) {
    const prompt = index.prompts[i];
    const isValid = validatePrompt(prompt, i);

    if (isValid) {
      results.valid++;
    }

    // Progress indicator
    if ((i + 1) % 100 === 0) {
      process.stdout.write(`\rValidated: ${i + 1}/${results.total}`);
    }
  }

  console.log(`\rValidated: ${results.total}/${results.total} ✓\n`);

  // Generate report
  generateReport(index);
}

function generateReport(index) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 VALIDATION REPORT');
  console.log('='.repeat(80) + '\n');

  console.log(`Total Prompts: ${results.total}`);
  console.log(`Valid Prompts: ${results.valid}`);
  console.log(`Invalid Prompts: ${results.total - results.valid}`);
  console.log(`Success Rate: ${((results.valid / results.total) * 100).toFixed(2)}%\n`);

  // Issue breakdown
  console.log('📋 ISSUE BREAKDOWN:\n');

  console.log(`❌ Missing Fields: ${results.stats.missingFields.length}`);
  if (results.stats.missingFields.length > 0 && results.stats.missingFields.length <= 10) {
    results.stats.missingFields.forEach(issue => {
      console.log(`   - "${issue.title}" (index ${issue.index}): ${issue.missing.join(', ')}`);
    });
  } else if (results.stats.missingFields.length > 10) {
    console.log(`   (Showing first 10)`);
    results.stats.missingFields.slice(0, 10).forEach(issue => {
      console.log(`   - "${issue.title}" (index ${issue.index}): ${issue.missing.join(', ')}`);
    });
  }

  console.log(`\n❌ Empty Fields: ${results.stats.emptyFields.length}`);
  if (results.stats.emptyFields.length > 0 && results.stats.emptyFields.length <= 10) {
    results.stats.emptyFields.forEach(issue => {
      console.log(`   - "${issue.title}" (index ${issue.index}): ${issue.issues.join(', ')}`);
    });
  } else if (results.stats.emptyFields.length > 10) {
    console.log(`   (Showing first 10)`);
    results.stats.emptyFields.slice(0, 10).forEach(issue => {
      console.log(`   - "${issue.title}" (index ${issue.index}): ${issue.issues.join(', ')}`);
    });
  }

  console.log(`\n❌ Invalid Values: ${results.stats.invalidValues.length}`);
  if (results.stats.invalidValues.length > 0 && results.stats.invalidValues.length <= 10) {
    results.stats.invalidValues.forEach(issue => {
      console.log(`   - "${issue.title}" (index ${issue.index}):`);
      issue.issues.forEach(i => console.log(`     • ${i}`));
    });
  } else if (results.stats.invalidValues.length > 10) {
    console.log(`   (Showing first 10)`);
    results.stats.invalidValues.slice(0, 10).forEach(issue => {
      console.log(`   - "${issue.title}" (index ${issue.index}):`);
      issue.issues.forEach(i => console.log(`     • ${i}`));
    });
  }

  console.log(`\n❌ Formatting Issues: ${results.stats.formattingIssues.length}`);
  if (results.stats.formattingIssues.length > 0 && results.stats.formattingIssues.length <= 10) {
    results.stats.formattingIssues.forEach(issue => {
      console.log(`   - "${issue.title}" (index ${issue.index}): ${issue.issues.join(', ')}`);
    });
  } else if (results.stats.formattingIssues.length > 10) {
    console.log(`   (Showing first 10)`);
    results.stats.formattingIssues.slice(0, 10).forEach(issue => {
      console.log(`   - "${issue.title}" (index ${issue.index}): ${issue.issues.join(', ')}`);
    });
  }

  console.log(`\n❌ Data Quality Issues: ${results.stats.dataQuality.length}`);
  if (results.stats.dataQuality.length > 0 && results.stats.dataQuality.length <= 10) {
    results.stats.dataQuality.forEach(issue => {
      console.log(`   - "${issue.title}" (index ${issue.index}):`);
      issue.issues.forEach(i => console.log(`     • ${i}`));
    });
  } else if (results.stats.dataQuality.length > 10) {
    console.log(`   (Showing first 10)`);
    results.stats.dataQuality.slice(0, 10).forEach(issue => {
      console.log(`   - "${issue.title}" (index ${issue.index}):`);
      issue.issues.forEach(i => console.log(`     • ${i}`));
    });
  }

  console.log(`\n⚠️  Warnings: ${results.stats.warnings.length}`);
  if (results.stats.warnings.length > 0 && results.stats.warnings.length <= 10) {
    results.stats.warnings.forEach(issue => {
      console.log(`   - "${issue.title}" (index ${issue.index}): ${issue.warning}`);
    });
  } else if (results.stats.warnings.length > 10) {
    console.log(`   (Showing first 10)`);
    results.stats.warnings.slice(0, 10).forEach(issue => {
      console.log(`   - "${issue.title}" (index ${issue.index}): ${issue.warning}`);
    });
  }

  // Department breakdown
  console.log('\n' + '='.repeat(80));
  console.log('📊 DEPARTMENT BREAKDOWN');
  console.log('='.repeat(80) + '\n');

  const deptCounts = {};
  index.prompts.forEach(p => {
    deptCounts[p.department] = (deptCounts[p.department] || 0) + 1;
  });

  Object.entries(deptCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([dept, count]) => {
      const icon = DEPARTMENT_EMOJIS[dept] || '❓';
      const percentage = ((count / results.total) * 100).toFixed(1);
      console.log(`${icon} ${dept.padEnd(15)} ${count.toString().padStart(4)} (${percentage}%)`);
    });

  // Save detailed report
  const reportPath = path.join(process.cwd(), 'validation-report.json');
  fs.writeFile(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Detailed report saved to: validation-report.json`);

  // Final summary
  console.log('\n' + '='.repeat(80));
  if (results.valid === results.total) {
    console.log('✅ ALL PROMPTS VALID! Database is in excellent condition.');
  } else {
    const issueCount = results.total - results.valid;
    console.log(`⚠️  ${issueCount} prompts have issues that need attention.`);
  }
  console.log('='.repeat(80) + '\n');
}

// Run validation
validateAllPrompts().catch(console.error);
