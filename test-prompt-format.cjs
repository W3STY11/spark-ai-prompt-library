// Test script to generate the EXACT format the Copilot agent should return
const data = require('./public/prompts_index.json');

// Get a marketing prompt with tips
const prompt = data.prompts.find(p =>
  p.department === 'Marketing' &&
  p.tips &&
  p.tips.length > 0
);

console.log('=== EXACT FORMAT THE COPILOT AGENT SHOULD RETURN ===\n');

// Format exactly as it should appear in Copilot
console.log(`**${prompt.title}** (${prompt.icon} ${prompt.department}${prompt.subcategory ? ' > ' + prompt.subcategory : ''} | ⚙️ Complexity: ${prompt.complexity.charAt(0).toUpperCase() + prompt.complexity.slice(1)} | 📊 ${prompt.word_count} words)\n`);

console.log(`**Description:** ${prompt.description}\n`);

console.log(`**📋 The Prompt:**`);
console.log('```');
console.log(prompt.content);
console.log('```\n');

if (prompt.tips && prompt.tips.length > 0) {
  console.log(`**💡 Tips & How to Use:**`);
  prompt.tips.forEach((tip, i) => {
    console.log(`${i + 1}. ${tip}`);
  });
  console.log('');
}

console.log(`**🏷️ Tags:** ${prompt.tags.join(', ')}\n`);

if (prompt.images && prompt.images.length > 0) {
  console.log(`**📸 Visuals:** ${prompt.images.length} image(s) available`);
  prompt.images.forEach(img => {
    console.log(`   - ${img}`);
  });
  console.log('');
}

console.log('---\n');
console.log('=== END OF FORMAT ===');
