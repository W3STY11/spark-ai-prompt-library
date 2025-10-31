# Update SPARK Copilot Agent in Microsoft 365
Connect-MgGraph -Scopes "AppCatalog.ReadWrite.All" -UseDeviceAuthentication -NoWelcome

$appId = "5783104e-c216-4184-bd48-a49b283e24fd"
$zipPath = "/home/aiwithnick/spark-ai-prompt-library/spark-copilot-agent.zip"

Write-Host "Updating SPARK Prompts Copilot Agent..." -ForegroundColor Cyan

# Read the ZIP file as bytes
$bytes = [System.IO.File]::ReadAllBytes($zipPath)

# Update the existing app
$uri = "https://graph.microsoft.com/v1.0/appCatalogs/teamsApps/$appId"
try {
    $response = Invoke-MgGraphRequest -Method PUT -Uri $uri -Body $bytes -ContentType "application/zip"
    Write-Host "✓ Successfully updated SPARK Prompts!" -ForegroundColor Green
    Write-Host "  Version: $(Get-Content spark-temp/manifest.json | ConvertFrom-Json | Select-Object -ExpandProperty version)" -ForegroundColor Green
    Write-Host "`nThe updated agent will be available in Microsoft Teams and Copilot." -ForegroundColor Green
} catch {
    Write-Host "✗ Update failed: $_" -ForegroundColor Red
    throw
}

Disconnect-MgGraph
