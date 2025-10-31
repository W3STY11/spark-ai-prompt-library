#!/usr/bin/env python3
"""
Deploy using PowerShell token with AppCatalog.ReadWrite.All permission.
This creates a PowerShell session, gets the token, and uses it immediately.
"""
import requests
import subprocess
import sys
import json
import time

APP_ID = "5783104e-c216-4184-bd48-a49b283e24fd"
ZIP_PATH = "/home/aiwithnick/spark-ai-prompt-library/spark-copilot-agent.zip"

print("🔐 Starting PowerShell session with device authentication...")
print("⏱️  This will take 10 minutes to allow time for authentication")
print()

# PowerShell script that connects and immediately outputs the token
pwsh_script = """
Connect-MgGraph -Scopes 'AppCatalog.ReadWrite.All' -UseDeviceAuthentication -NoWelcome
$context = Get-MgContext
if ($null -eq $context) {
    Write-Output "ERROR:NO_CONTEXT"
    exit 1
}
# Get the token by making a dummy request with HttpResponseMessage output
$Uri = 'https://graph.microsoft.com/v1.0/me'
$Data = Invoke-MgGraphRequest -Uri $Uri -Method Get -OutputType HttpResponseMessage
$token = $Data.RequestMessage.Headers.Authorization.Parameter
if ($null -eq $token -or $token.Length -lt 50) {
    Write-Output "ERROR:NO_TOKEN"
    exit 1
}
Write-Output "TOKEN:$token"
Disconnect-MgGraph
"""

try:
    # Run PowerShell with 10 minute timeout to allow authentication
    result = subprocess.run(
        ["pwsh", "-Command", pwsh_script],
        capture_output=True,
        text=True,
        timeout=600  # 10 minutes
    )

    output = result.stdout

    if "ERROR:NO_CONTEXT" in output:
        print("❌ PowerShell failed to establish Graph API context")
        print("   Output:", output)
        sys.exit(1)

    if "ERROR:NO_TOKEN" in output:
        print("❌ PowerShell context established but no token available")
        print("   Output:", output)
        sys.exit(1)

    # Extract token from output
    token_line = [line for line in output.split('\n') if line.startswith('TOKEN:')]
    if not token_line:
        print("❌ Could not find token in PowerShell output")
        print("   Output:", output)
        sys.exit(1)

    access_token = token_line[0].replace('TOKEN:', '').strip()

    if not access_token or len(access_token) < 50:
        print("❌ Invalid token received from PowerShell")
        print(f"   Token length: {len(access_token)}")
        sys.exit(1)

    print("✅ Got valid access token from PowerShell Graph SDK")
    print(f"   Token length: {len(access_token)} characters")

except subprocess.TimeoutExpired:
    print("❌ PowerShell authentication timed out after 10 minutes")
    print("   This likely means you didn't complete the device authentication")
    sys.exit(1)
except Exception as e:
    print(f"❌ Failed to get token from PowerShell: {e}")
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
