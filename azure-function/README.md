# SPARK Copilot API - Azure Function

This Azure Function serves as the backend API for the SPARK AI Prompt Library Copilot plugin in Microsoft Teams.

## Architecture

- **Function App**: `spark-copilot-api.azurewebsites.net`
- **Data Source**: Azure Storage Account `sparkpromptstorage` → `data` container → `prompts_index.json`
- **Contains**: 1,812 professional AI prompts across 9 departments

## Files

- `prompts/index.js` - Main HTTP trigger function
- `prompts/function.json` - Function binding configuration
- `package.json` - Node.js dependencies
- `host.json` - Function App host configuration
- `openapi.yaml` - OpenAPI 3.0 specification for Copilot
- `local.settings.json` - Local development settings

## Deployment Steps

### 1. Install Azure Functions Core Tools
```bash
npm install -g azure-functions-core-tools@4
```

### 2. Install Dependencies
```bash
cd azure-function
npm install
```

### 3. Enable Managed Identity
The function uses Managed Identity to access Azure Storage. Enable it:
```bash
az functionapp identity assign \
  --name spark-copilot-api \
  --resource-group spark-rg
```

### 4. Grant Storage Access
Give the function app permission to read from storage:
```bash
# Get the function app's principal ID
PRINCIPAL_ID=$(az functionapp identity show \
  --name spark-copilot-api \
  --resource-group spark-rg \
  --query principalId \
  --output tsv)

# Assign Storage Blob Data Reader role
az role assignment create \
  --assignee $PRINCIPAL_ID \
  --role "Storage Blob Data Reader" \
  --scope "/subscriptions/9f67cd8f-9137-4b1f-96d7-1ff1b762a57a/resourceGroups/spark-rg/providers/Microsoft.Storage/storageAccounts/sparkpromptstorage"
```

### 5. Deploy Function
```bash
func azure functionapp publish spark-copilot-api
```

## API Endpoints

### GET /api/prompts

Returns AI prompts with optional filtering.

**Query Parameters:**
- `department` - Filter by department (Business, Marketing, Sales, etc.)
- `subcategory` - Filter by subcategory
- `search` - Search term for title/description/content
- `limit` - Max results (default: 50, max: 100)

**Example:**
```bash
curl "https://spark-copilot-api.azurewebsites.net/api/prompts?department=Business&limit=10"
```

## Microsoft Teams Integration

### Update Teams Manifest

Add this to your `manifest.json`:

```json
{
  "composeExtensions": [
    {
      "botId": "YOUR_BOT_ID",
      "canUpdateConfiguration": false,
      "commands": [
        {
          "id": "searchPrompts",
          "type": "query",
          "title": "Search AI Prompts",
          "description": "Search 1,812+ professional AI prompts",
          "parameters": [
            {
              "name": "search",
              "title": "Search",
              "description": "Search for prompts",
              "inputType": "text"
            }
          ],
          "apiSpecificationFile": "openapi.yaml"
        }
      ]
    }
  ]
}
```

## Testing Locally

```bash
# Start local function
func start

# Test endpoint
curl "http://localhost:7071/api/prompts?limit=5"
```

## Monitoring

View logs in Azure:
```bash
az functionapp logs tail \
  --name spark-copilot-api \
  --resource-group spark-rg
```

## Data Structure

The API returns prompts in this format:

```json
{
  "total": 10,
  "prompts": [
    {
      "id": "abc123",
      "title": "Generate Lead-Nurturing Emails",
      "department": "Business",
      "subcategory": "Business Communications",
      "description": "Brief description...",
      "content": "Full prompt content...",
      "icon": "💼",
      "word_count": 450
    }
  ]
}
```

## Troubleshooting

### Issue: Function can't access storage
**Solution**: Verify Managed Identity is enabled and has Storage Blob Data Reader role

### Issue: CORS errors from Teams
**Solution**: Function already has `Access-Control-Allow-Origin: *` header

### Issue: Cold start latency
**Solution**: Using Flex Consumption plan with fast cold start
