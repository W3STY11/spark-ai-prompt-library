#!/usr/bin/env node
/**
 * Test script to fetch one page and see all properties
 */

const NOTION_API_KEY = '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';
const BUSINESS_DB_ID = '2733f44c-2287-8100-a944-c4619ae0e580';

async function testFetch() {
  // Fetch first page from Business database
  const response = await fetch(`https://api.notion.com/v1/databases/${BUSINESS_DB_ID}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      page_size: 1
    })
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Error:', data);
    return;
  }

  const page = data.results[0];
  console.log('=== PAGE PROPERTIES ===');
  console.log(JSON.stringify(page.properties, null, 2));
}

testFetch().catch(console.error);
