#!/bin/bash

# SPARK Copilot API Deployment Script

set -e

echo "🚀 Deploying SPARK Copilot API to Azure..."

# Variables
FUNCTION_APP="spark-copilot-api"
RESOURCE_GROUP="spark-rg"
STORAGE_ACCOUNT="sparkpromptstorage"
SUBSCRIPTION_ID="9f67cd8f-9137-4b1f-96d7-1ff1b762a57a"

# Check if logged in to Azure
if ! az account show &> /dev/null; then
    echo "❌ Not logged in to Azure. Please run: az login"
    exit 1
fi

echo "✅ Logged in to Azure as: $(az account show --query user.name -o tsv)"

# Install dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Enable Managed Identity
echo "🔐 Enabling Managed Identity..."
az functionapp identity assign \
  --name $FUNCTION_APP \
  --resource-group $RESOURCE_GROUP \
  --output none

# Get the Managed Identity principal ID
echo "🔍 Getting Managed Identity principal ID..."
PRINCIPAL_ID=$(az functionapp identity show \
  --name $FUNCTION_APP \
  --resource-group $RESOURCE_GROUP \
  --query principalId \
  --output tsv)

echo "✅ Principal ID: $PRINCIPAL_ID"

# Grant Storage Blob Data Reader role
echo "🔒 Granting Storage Blob Data Reader role..."
az role assignment create \
  --assignee $PRINCIPAL_ID \
  --role "Storage Blob Data Reader" \
  --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Storage/storageAccounts/$STORAGE_ACCOUNT" \
  --output none 2>/dev/null || echo "⚠️  Role assignment may already exist"

# Deploy function
echo "📤 Deploying function to Azure..."
func azure functionapp publish $FUNCTION_APP --javascript

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 API URL: https://$FUNCTION_APP.azurewebsites.net/api/prompts"
echo ""
echo "Test it:"
echo "  curl \"https://$FUNCTION_APP.azurewebsites.net/api/prompts?limit=5\""
echo ""
echo "View logs:"
echo "  az functionapp logs tail --name $FUNCTION_APP --resource-group $RESOURCE_GROUP"
