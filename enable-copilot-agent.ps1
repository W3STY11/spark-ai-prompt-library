# Enable SPARK Copilot Agent in Teams
Connect-MgGraph -Scopes "AppCatalog.ReadWrite.All" -NoWelcome

$appId = "5783104e-c216-4184-bd48-a49b283e24fd"

# Get the app definition
$uri = "https://graph.microsoft.com/v1.0/appCatalogs/teamsApps/$appId"
try {
    $app = Invoke-MgGraphRequest -Method GET -Uri $uri
    Write-Host "✓ Found app: $($app.displayName)" -ForegroundColor Green
    Write-Host "  External ID: $($app.externalId)" -ForegroundColor Cyan
    Write-Host "  Distribution Method: $($app.distributionMethod)" -ForegroundColor Cyan

    # Get app definitions (versions)
    $defsUri = "https://graph.microsoft.com/v1.0/appCatalogs/teamsApps/$appId/appDefinitions"
    $definitions = Invoke-MgGraphRequest -Method GET -Uri $defsUri

    Write-Host "`n✓ Available versions:" -ForegroundColor Green
    foreach ($def in $definitions.value) {
        Write-Host "  - Version: $($def.version) (ID: $($def.id))" -ForegroundColor Cyan
    }

} catch {
    Write-Host "✗ Failed to get app: $_" -ForegroundColor Red
    throw
}

Disconnect-MgGraph
