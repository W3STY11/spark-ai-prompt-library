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

  // Fix broken words (like "cle ar" -> "clear")
  content = content.replace(/(\w) (\w)/g, (match, p1, p2) => {
    // Only fix if it looks like a broken word within a sentence
    if (p1.toLowerCase() !== p1.toUpperCase() && p2.toLowerCase() !== p2.toUpperCase()) {
      const combined = p1 + p2;
      // Check if it looks like it should be one word
      if (combined.length < 15 && !combined.includes('#') && !combined.includes(':')) {
        return combined;
      }
    }
    return match;
  });

  // Add line breaks after section headers
  content = content.replace(/(#[A-Z\s]+:)/g, '\n\n$1\n');

  // Add line breaks before numbered lists
  content = content.replace(/(\d+\.\s)/g, '\n$1');

  // Add line breaks for bullet points
  content = content.replace(/(-\s[A-Z])/g, '\n$1');

  // Clean up multiple spaces
  content = content.replace(/\s{2,}/g, ' ');

  // Clean up multiple line breaks
  content = content.replace(/\n{3,}/g, '\n\n');

  // Trim whitespace
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

// Fix each prompt
data.prompts = data.prompts.map(prompt => {
  return {
    ...prompt,
    content: fixPromptContent(prompt.content),
    tips: fixTips(prompt.tips)
  };
});

// Create backup of original
const backupPath = path.join(__dirname, 'public', 'prompts_index_backup.json');
if (!fs.existsSync(backupPath)) {
  fs.copyFileSync(indexPath, backupPath);
  console.log('Created backup at:', backupPath);
}

// Write the fixed data
fs.writeFileSync(indexPath, JSON.stringify(data, null, 2));
console.log('Fixed prompt formatting in:', indexPath);
console.log('Total prompts processed:', data.prompts.length);