#!/bin/bash

echo "════════════════════════════════════════════════════════════════════════════════"
echo "🧪 SPARK PROMPT LIBRARY - INTEGRATION TEST SUITE"
echo "════════════════════════════════════════════════════════════════════════════════"
echo ""

# Test 1: Browse Page
echo "═══ TEST 1/3: Browse Page ═══"
node test_browse_page.mjs
echo ""

# Test 2: Admin Authentication
echo "═══ TEST 2/3: Admin Authentication ═══"
node test_admin_auth.mjs
echo ""

# Test 3: Admin Features
echo "═══ TEST 3/3: Admin Features ═══"
node test_admin_features.mjs
echo ""

echo "════════════════════════════════════════════════════════════════════════════════"
echo "✅ ALL TESTS COMPLETE"
echo "════════════════════════════════════════════════════════════════════════════════"
echo ""
echo "📸 Screenshots available in: /tmp/spark-test-screenshots/"
echo "📝 Full test report: COMPLETE_TEST_REPORT.md"
echo ""
