#!/bin/bash

# SPARK Admin Dashboard & Library - Azure Deployment Test Suite
# Tests all admin and library functionality on Azure deployment

API_URL="http://20.75.218.182:3001"
FRONTEND_URL="https://gray-ocean-059c8510f.3.azurestaticapps.net"
PASSWORD="admin123"

echo "==========================================="
echo "SPARK AZURE DEPLOYMENT - COMPREHENSIVE TEST"
echo "==========================================="
echo ""
echo "API URL: $API_URL"
echo "Frontend URL: $FRONTEND_URL"
echo ""

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Test 1: Admin Authentication
echo "--- TEST 1: Admin Authentication ---"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/admin/login" \
  -H "Content-Type: application/json" \
  -d "{\"password\":\"$PASSWORD\"}")

if echo "$LOGIN_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
  echo "✅ PASS: Admin login successful"
  echo "   Token: ${TOKEN:0:20}..."
  ((TESTS_PASSED++))
else
  echo "❌ FAIL: Admin login failed"
  echo "   Response: $LOGIN_RESPONSE"
  ((TESTS_FAILED++))
  exit 1
fi
echo ""

# Test 2: Get All Prompts
echo "--- TEST 2: Get All Prompts ---"
PROMPTS_RESPONSE=$(curl -s "$API_URL/api/prompts")
PROMPT_COUNT=$(echo "$PROMPTS_RESPONSE" | jq -r '.meta.total_prompts // 0')

if [ "$PROMPT_COUNT" -gt 0 ]; then
  echo "✅ PASS: Retrieved $PROMPT_COUNT prompts"
  ((TESTS_PASSED++))
else
  echo "❌ FAIL: No prompts retrieved"
  ((TESTS_FAILED++))
fi
echo ""

# Test 3: Get Single Prompt
echo "--- TEST 3: Get Single Prompt ---"
FIRST_PROMPT_ID=$(echo "$PROMPTS_RESPONSE" | jq -r '.prompts[0].id')
SINGLE_PROMPT=$(curl -s "$API_URL/api/prompts/$FIRST_PROMPT_ID")

if echo "$SINGLE_PROMPT" | jq -e '.id' > /dev/null 2>&1; then
  PROMPT_TITLE=$(echo "$SINGLE_PROMPT" | jq -r '.title')
  echo "✅ PASS: Retrieved single prompt"
  echo "   ID: $FIRST_PROMPT_ID"
  echo "   Title: $PROMPT_TITLE"
  ((TESTS_PASSED++))
else
  echo "❌ FAIL: Could not retrieve single prompt"
  ((TESTS_FAILED++))
fi
echo ""

# Test 4: Create New Prompt
echo "--- TEST 4: Create New Prompt (Test) ---"
NEW_PROMPT=$(cat <<'EOF'
{
  "title": "Test Prompt - Azure Deployment Test",
  "department": "Productivity",
  "subcategory": "Testing",
  "description": "This is a test prompt created by automated testing",
  "content": "This is the test prompt content for verification purposes.",
  "tags": ["test", "automation", "azure"],
  "complexity": "Basic",
  "tips": "This is a test tip for testing purposes",
  "images": []
}
EOF
)

CREATE_RESPONSE=$(curl -s -X POST "$API_URL/api/prompts" \
  -H "Content-Type: application/json" \
  -d "$NEW_PROMPT")

if echo "$CREATE_RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
  TEST_PROMPT_ID=$(echo "$CREATE_RESPONSE" | jq -r '.id')
  echo "✅ PASS: Created new test prompt"
  echo "   ID: $TEST_PROMPT_ID"
  ((TESTS_PASSED++))
else
  echo "❌ FAIL: Could not create new prompt"
  echo "   Response: $CREATE_RESPONSE"
  ((TESTS_FAILED++))
  TEST_PROMPT_ID=""
fi
echo ""

# Test 5: Edit Prompt (requires auth)
if [ -n "$TEST_PROMPT_ID" ]; then
  echo "--- TEST 5: Edit Prompt (Authenticated) ---"
  UPDATED_PROMPT=$(cat <<EOF
{
  "title": "Test Prompt - UPDATED via API",
  "department": "Productivity",
  "subcategory": "Testing - Updated",
  "description": "This prompt has been updated via automated testing",
  "content": "Updated content for testing edit functionality.",
  "tags": ["test", "automation", "azure", "updated"],
  "complexity": "Intermediate",
  "tips": "Updated tips for testing",
  "images": []
}
EOF
)

  UPDATE_RESPONSE=$(curl -s -X PUT "$API_URL/api/prompts/$TEST_PROMPT_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "$UPDATED_PROMPT")

  if echo "$UPDATE_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo "✅ PASS: Updated test prompt"
    echo "   ID: $TEST_PROMPT_ID"
    ((TESTS_PASSED++))
  else
    echo "❌ FAIL: Could not update prompt"
    echo "   Response: $UPDATE_RESPONSE"
    ((TESTS_FAILED++))
  fi
  echo ""
fi

# Test 6: Data Validation
echo "--- TEST 6: Data Validation ---"
VALIDATION_RESPONSE=$(curl -s "$API_URL/api/admin/validate" \
  -H "Authorization: Bearer $TOKEN")

if echo "$VALIDATION_RESPONSE" | jq -e '.summary' > /dev/null 2>&1; then
  TOTAL_ISSUES=$(echo "$VALIDATION_RESPONSE" | jq -r '.summary.total_issues')
  echo "✅ PASS: Data validation completed"
  echo "   Total Issues: $TOTAL_ISSUES"
  ((TESTS_PASSED++))
else
  echo "❌ FAIL: Data validation failed"
  ((TESTS_FAILED++))
fi
echo ""

# Test 7: Manual Backup
echo "--- TEST 7: Manual Backup Creation ---"
BACKUP_RESPONSE=$(curl -s -X POST "$API_URL/api/admin/backup" \
  -H "Authorization: Bearer $TOKEN")

if echo "$BACKUP_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  BACKUP_FILE=$(echo "$BACKUP_RESPONSE" | jq -r '.filename')
  echo "✅ PASS: Manual backup created"
  echo "   File: $BACKUP_FILE"
  ((TESTS_PASSED++))
else
  echo "❌ FAIL: Manual backup failed"
  ((TESTS_FAILED++))
fi
echo ""

# Test 8: Bulk Import Test
echo "--- TEST 8: Bulk Import (JSON) ---"
BULK_DATA=$(cat <<'EOF'
{
  "prompts": [
    {
      "title": "Bulk Import Test Prompt 1",
      "department": "Business",
      "subcategory": "Testing",
      "description": "First bulk import test prompt",
      "content": "Content for bulk test 1",
      "tags": ["bulk", "test"],
      "complexity": "Basic",
      "tips": "Bulk test tips 1"
    },
    {
      "title": "Bulk Import Test Prompt 2",
      "department": "Marketing",
      "subcategory": "Testing",
      "description": "Second bulk import test prompt",
      "content": "Content for bulk test 2",
      "tags": ["bulk", "test"],
      "complexity": "Basic",
      "tips": "Bulk test tips 2"
    }
  ]
}
EOF
)

BULK_IMPORT_RESPONSE=$(curl -s -X POST "$API_URL/api/prompts/bulk" \
  -H "Content-Type: application/json" \
  -d "$BULK_DATA")

if echo "$BULK_IMPORT_RESPONSE" | jq -e '.imported' > /dev/null 2>&1; then
  IMPORTED_COUNT=$(echo "$BULK_IMPORT_RESPONSE" | jq -r '.imported | length')
  echo "✅ PASS: Bulk import successful"
  echo "   Imported: $IMPORTED_COUNT prompts"
  ((TESTS_PASSED++))

  # Store IDs for cleanup
  BULK_ID_1=$(echo "$BULK_IMPORT_RESPONSE" | jq -r '.imported[0].id')
  BULK_ID_2=$(echo "$BULK_IMPORT_RESPONSE" | jq -r '.imported[1].id')
else
  echo "❌ FAIL: Bulk import failed"
  echo "   Response: $BULK_IMPORT_RESPONSE"
  ((TESTS_FAILED++))
fi
echo ""

# Test 9: Delete Test Prompts (cleanup)
echo "--- TEST 9: Delete Test Prompts (Cleanup) ---"
DELETED_COUNT=0

if [ -n "$TEST_PROMPT_ID" ]; then
  DELETE_RESPONSE=$(curl -s -X DELETE "$API_URL/api/prompts/$TEST_PROMPT_ID" \
    -H "Authorization: Bearer $TOKEN")
  if echo "$DELETE_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    ((DELETED_COUNT++))
  fi
fi

if [ -n "$BULK_ID_1" ]; then
  curl -s -X DELETE "$API_URL/api/prompts/$BULK_ID_1" \
    -H "Authorization: Bearer $TOKEN" > /dev/null
  ((DELETED_COUNT++))
fi

if [ -n "$BULK_ID_2" ]; then
  curl -s -X DELETE "$API_URL/api/prompts/$BULK_ID_2" \
    -H "Authorization: Bearer $TOKEN" > /dev/null
  ((DELETED_COUNT++))
fi

if [ $DELETED_COUNT -gt 0 ]; then
  echo "✅ PASS: Deleted $DELETED_COUNT test prompts"
  ((TESTS_PASSED++))
else
  echo "⚠️  SKIP: No test prompts to delete"
fi
echo ""

# Test 10: Frontend Homepage
echo "--- TEST 10: Frontend Homepage ---"
HOMEPAGE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL/")

if [ "$HOMEPAGE_RESPONSE" = "200" ]; then
  echo "✅ PASS: Frontend homepage accessible"
  echo "   HTTP Status: $HOMEPAGE_RESPONSE"
  ((TESTS_PASSED++))
else
  echo "❌ FAIL: Frontend homepage not accessible"
  echo "   HTTP Status: $HOMEPAGE_RESPONSE"
  ((TESTS_FAILED++))
fi
echo ""

# Test 11: Frontend prompts_index.json
echo "--- TEST 11: Frontend Data File ---"
INDEX_RESPONSE=$(curl -s "$FRONTEND_URL/prompts_index.json")
INDEX_PROMPT_COUNT=$(echo "$INDEX_RESPONSE" | jq -r '.meta.total_prompts // 0')

if [ "$INDEX_PROMPT_COUNT" -gt 0 ]; then
  echo "✅ PASS: Frontend data file accessible"
  echo "   Prompts in index: $INDEX_PROMPT_COUNT"
  ((TESTS_PASSED++))
else
  echo "❌ FAIL: Frontend data file not accessible or empty"
  ((TESTS_FAILED++))
fi
echo ""

# Test Summary
echo "==========================================="
echo "TEST SUMMARY"
echo "==========================================="
echo "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"
echo "✅ Passed: $TESTS_PASSED"
echo "❌ Failed: $TESTS_FAILED"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo "🎉 ALL TESTS PASSED! Azure deployment is fully functional."
  exit 0
else
  echo "⚠️  Some tests failed. Please review the output above."
  exit 1
fi
