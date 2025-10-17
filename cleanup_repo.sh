#!/bin/bash
# SPARK Prompt Library Repository Cleanup Script
# Safe removal of development artifacts and test files
#
# BEFORE RUNNING:
# 1. Review CLEANUP_ANALYSIS.md
# 2. Make sure you're in the spark-prompt-library directory
# 3. Run: chmod +x cleanup_repo.sh
# 4. Run: ./cleanup_repo.sh
#
# This script will:
# - Remove 1.4GB of old build files
# - Remove test screenshots (3.4MB)
# - Remove test scripts (115KB)
# - Remove test results (5MB)
# - Remove old integration files (100KB)
# - Remove redundant documentation (20KB)
#
# Total space saved: ~1.41GB

set -e  # Exit on any error

echo "🧹 SPARK Prompt Library - Repository Cleanup"
echo "============================================="
echo ""
echo "This will remove ~1.41GB of development artifacts"
echo "All essential files will be preserved."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "src" ]; then
    echo "❌ ERROR: Must run this script from spark-prompt-library directory"
    echo "Current directory: $(pwd)"
    exit 1
fi

# Confirm with user
read -p "Continue with cleanup? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cleanup cancelled"
    exit 0
fi

echo ""
echo "Starting cleanup..."
echo ""

# Category 1: Remove dist.backup (1.4GB)
if [ -d "dist.backup" ]; then
    echo "📦 Removing old build artifacts (dist.backup/)..."
    rm -rf dist.backup/
    echo "   ✅ Removed 1.4GB"
else
    echo "   ⏭️  dist.backup/ not found (already removed)"
fi

# Category 2: Remove test screenshots
echo "📸 Removing development screenshots..."
REMOVED_PNG=0
for file in *.png; do
    if [ -f "$file" ]; then
        rm -f "$file"
        REMOVED_PNG=$((REMOVED_PNG + 1))
    fi
done
if [ $REMOVED_PNG -gt 0 ]; then
    echo "   ✅ Removed $REMOVED_PNG PNG files (~3.4MB)"
else
    echo "   ⏭️  No PNG files found (already removed)"
fi

# Category 3: Remove test scripts
echo "🧪 Removing test scripts..."
TEST_SCRIPTS=(
    "bulk_import_visual_test.mjs"
    "capture-live-library-prompt.mjs"
    "check-browser-load.mjs"
    "check-new-prompt.mjs"
    "examine-existing-prompts.mjs"
    "run_comprehensive_tests.mjs"
    "show-test-prompts.mjs"
    "test-add-prompt-form.mjs"
    "test-category-auto-populate.mjs"
    "test-new-prompt-properly.mjs"
    "view-final-prompt.mjs"
    "view-manually-fixed-prompt.mjs"
    "view-prompts.mjs"
    "view-real-prompt.mjs"
    "visual_validation_suite.mjs"
)

REMOVED_SCRIPTS=0
for script in "${TEST_SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        rm -f "$script"
        REMOVED_SCRIPTS=$((REMOVED_SCRIPTS + 1))
    fi
done
if [ $REMOVED_SCRIPTS -gt 0 ]; then
    echo "   ✅ Removed $REMOVED_SCRIPTS test scripts (~115KB)"
else
    echo "   ⏭️  No test scripts found (already removed)"
fi

# Category 4: Remove test results and data
echo "📋 Removing test results..."
REMOVED_DIRS=0
if [ -d "test-results" ]; then
    rm -rf test-results/
    REMOVED_DIRS=$((REMOVED_DIRS + 1))
fi
if [ -d "test-results-comprehensive" ]; then
    rm -rf test-results-comprehensive/
    REMOVED_DIRS=$((REMOVED_DIRS + 1))
fi

REMOVED_TEST_DATA=0
for file in test-data-*.json sample-bulk-import.json; do
    if [ -f "$file" ]; then
        rm -f "$file"
        REMOVED_TEST_DATA=$((REMOVED_TEST_DATA + 1))
    fi
done

if [ $REMOVED_DIRS -gt 0 ] || [ $REMOVED_TEST_DATA -gt 0 ]; then
    echo "   ✅ Removed test results and data (~5MB)"
else
    echo "   ⏭️  No test results found (already removed)"
fi

# Category 5: Remove old integration
if [ -d "copilot-integration" ]; then
    echo "🔌 Removing old copilot integration..."
    rm -rf copilot-integration/
    echo "   ✅ Removed copilot-integration/ (~100KB)"
else
    echo "   ⏭️  copilot-integration/ not found (already removed)"
fi

# Category 6: Remove redundant docs
echo "📄 Removing redundant documentation..."
REMOVED_DOCS=0
for doc in READY_FOR_DEMO.md TEST_RESULTS_SUMMARY.md; do
    if [ -f "$doc" ]; then
        rm -f "$doc"
        REMOVED_DOCS=$((REMOVED_DOCS + 1))
    fi
done
if [ $REMOVED_DOCS -gt 0 ]; then
    echo "   ✅ Removed $REMOVED_DOCS redundant docs (~20KB)"
else
    echo "   ⏭️  No redundant docs found (already removed)"
fi

echo ""
echo "============================================="
echo "✅ CLEANUP COMPLETE!"
echo "============================================="
echo ""
echo "📊 Space saved: ~1.41GB"
echo "📦 Files removed: ~2,400 development artifacts"
echo ""
echo "✅ Essential files preserved:"
echo "   • All source code (src/, server/, scripts/)"
echo "   • All prompts (public/ - 2,376 prompts)"
echo "   • Docker configuration"
echo "   • Dependencies (package.json, node_modules/)"
echo "   • Documentation (README, SYNC_EXPLANATION, ARCHITECTURE)"
echo ""
echo "🔍 Verification steps:"
echo "   1. docker-compose up -d          # Test application"
echo "   2. curl http://localhost:3000    # Check it loads"
echo "   3. git status                    # See what was removed"
echo ""
echo "📝 Next steps:"
echo "   1. Test the application works"
echo "   2. Commit changes: git add -A && git commit -m 'Clean up repository'"
echo "   3. Push to GitHub: git push origin main"
echo ""
