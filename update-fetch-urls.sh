#!/bin/bash
# Script to update fetch URLs in all component files to use BLOB_ENDPOINTS.PROMPTS_INDEX

FILES=(
  "src/components/BrowsePage.jsx"
  "src/components/ViewPage.jsx"
  "src/components/FavoritesPage.jsx"
  "src/components/AdminDashboardPage.jsx"
)

for file in "${FILES[@]}"; do
  echo "Processing $file..."

  # Check if import already exists
  if ! grep -q "import.*BLOB_ENDPOINTS.*from.*config" "$file"; then
    # Add import after the react-router import if it exists
    if grep -q "from 'react-router-dom'" "$file"; then
      sed -i "/from 'react-router-dom'/a import { BLOB_ENDPOINTS } from '../config';" "$file"
    else
      # Add after React import
      sed -i "/from 'react'/a import { BLOB_ENDPOINTS } from '../config';" "$file"
    fi
    echo "  Added BLOB_ENDPOINTS import"
  fi

  # Replace fetch('/prompts_index.json') with fetch(BLOB_ENDPOINTS.PROMPTS_INDEX)
  sed -i "s|fetch('/prompts_index\.json')|fetch(BLOB_ENDPOINTS.PROMPTS_INDEX)|g" "$file"
  echo "  Updated fetch URL to use BLOB_ENDPOINTS.PROMPTS_INDEX"
done

echo "All files updated!"
