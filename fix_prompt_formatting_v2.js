import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the prompts index
const indexPath = path.join(__dirname, 'public', 'prompts_index.json');
const data = JSON.parse(fs.readFileSync(indexPath, 'utf8'));

// Function to fix prompt content formatting
function fixPromptContent(content) {
  if (!content) return content;

  // The content seems to have lost proper line breaks and formatting
  // Let's add proper formatting for the sections

  // Add proper line breaks after section headers
  content = content.replace(/(#[A-Z\s]+:)/g, '\n\n$1\n');

  // Fix numbered lists - add line break before each number
  content = content.replace(/(\d+\.)\s/g, '\n$1 ');

  // Fix bullet points - add line break before each bullet
  content = content.replace(/(\s)(-\s[A-Z])/g, '$1\n$2');

  // Clean up excessive line breaks (more than 3)
  content = content.replace(/\n{4,}/g, '\n\n\n');

  // Ensure the content starts clean
  content = content.trim();

  return content;
}

// Function to fix tips formatting
function fixTips(tips) {
  if (!tips || !Array.isArray(tips)) return tips;

  // Check if all tips are in one string separated by ●
  if (tips.length === 1 && tips[0].includes('●')) {
    return tips[0].split('●')
      .map(tip => tip.trim())
      .filter(tip => tip.length > 0);
  }

  return tips;
}

// Function to fix tags (remove extra spaces)
function fixTags(tags) {
  if (!tags || !Array.isArray(tags)) return tags;

  return tags.map(tag => tag.trim().replace(/\s{2,}/g, ' '));
}

// Fix each prompt
let fixedCount = 0;
data.prompts = data.prompts.map(prompt => {
  const oldContent = prompt.content;
  const newContent = fixPromptContent(oldContent);

  if (oldContent !== newContent) {
    fixedCount++;
  }

  return {
    ...prompt,
    content: newContent,
    tips: fixTips(prompt.tips),
    tags: fixTags(prompt.tags)
  };
});

// Write the fixed data
fs.writeFileSync(indexPath, JSON.stringify(data, null, 2));
console.log('Fixed prompt formatting in:', indexPath);
console.log('Total prompts processed:', data.prompts.length);
console.log('Prompts with formatting fixes:', fixedCount);