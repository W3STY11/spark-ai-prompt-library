#!/usr/bin/env python3
"""
Direct Microsoft Graph API upload using REST API.
This bypasses PowerShell authentication issues.
"""
import requests
import subprocess
import sys

APP_ID = "5783104e-c216-4184-bd48-a49b283e24fd"
ZIP_PATH = "/home/aiwithnick/spark-ai-prompt-library/spark-copilot-agent.zip"

print("🔑 Attempting to get access token from Az CLI...")

try:
    # Try to get token from az CLI with AppCatalog.ReadWrite.All scope
    result = subprocess.run(
        ["az", "rest", "--method", "GET", "--url", "https://graph.microsoft.com/v1.0/me",
         "--output", "json"],
        capture_output=True,
        text=True,
        check=True
    )

    # If that works, get the actual token with proper scopes
    result = subprocess.run(
        ["az", "account", "get-access-token",
         "--scope", "https://graph.microsoft.com/.default"],
        capture_output=True,
        text=True,
        check=True
    )

    import json
    token_data = json.loads(result.stdout)
    access_token = token_data["accessToken"]
    print("✓ Got access token from Az CLI")

except Exception as e:
    print(f"✗ Failed to get token from Az CLI: {e}")
    print("\n⚠️  Please run: az login")
    sys.exit(1)

print(f"\n📦 Uploading package from: {ZIP_PATH}")
print(f"📱 App ID: {APP_ID}")

# Read the ZIP file
with open(ZIP_PATH, "rb") as f:
    zip_bytes = f.read()

print(f"✓ Read {len(zip_bytes)} bytes from package")

# Upload to Microsoft Graph API
url = f"https://graph.microsoft.com/v1.0/appCatalogs/teamsApps/{APP_ID}"
headers = {
    "Authorization": f"Bearer {access_token}",
    "Content-Type": "application/zip"
}

print(f"\n🚀 Uploading to Graph API...")
print(f"   URL: {url}")

response = requests.put(url, data=zip_bytes, headers=headers)

if response.status_code in [200, 201, 204]:
    print("\n✅ SUCCESS! SPARK Prompts v1.0.4 deployed to Microsoft 365!")
    print(f"   Status Code: {response.status_code}")
    print("\n🎉 The updated agent is now available in Microsoft Teams and Copilot.")
else:
    print(f"\n❌ FAILED: HTTP {response.status_code}")
    print(f"Response: {response.text}")
    sys.exit(1)
