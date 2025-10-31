# Upload SPARK Copilot Agent to Microsoft 365
Connect-MgGraph -Scopes "AppCatalog.ReadWrite.All" -NoWelcome

$appPackagePath = "/home/aiwithnick/spark-ai-prompt-library/spark-copilot-agent.zip"
$bytes = [System.IO.File]::ReadAllBytes($appPackagePath)

$uri = "https://graph.microsoft.com/v1.0/appCatalogs/teamsApps"
$headers = @{
    "Content-Type" = "application/zip"
}

try {
    $response = Invoke-MgGraphRequest -Method POST -Uri $uri -Body $bytes -Headers $headers -ContentType "application/zip"
    Write-Host "✓ Successfully uploaded SPARK Copilot Agent!" -ForegroundColor Green
    Write-Host "App ID: $($response.id)"
    Write-Host "Display Name: $($response.displayName)"
    Write-Host "Version: $($response.version)"
} catch {
    Write-Host "✗ Upload failed: $_" -ForegroundColor Red
    throw
}

Disconnect-MgGraph
