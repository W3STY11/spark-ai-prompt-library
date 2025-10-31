# Install SPARK Copilot Agent for current user
Connect-MgGraph -Scopes "TeamsAppInstallation.ReadWriteForUser" -NoWelcome

$appId = "5783104e-c216-4184-bd48-a49b283e24fd"

# Get current user ID
$meUri = "https://graph.microsoft.com/v1.0/me"
$me = Invoke-MgGraphRequest -Method GET -Uri $meUri
$userId = $me.id

Write-Host "Installing SPARK Prompts for user: $($me.userPrincipalName)" -ForegroundColor Cyan

# Install the app for the user
$installUri = "https://graph.microsoft.com/v1.0/users/$userId/teamwork/installedApps"
$body = @{
    "teamsApp@odata.bind" = "https://graph.microsoft.com/v1.0/appCatalogs/teamsApps/$appId"
} | ConvertTo-Json

try {
    $result = Invoke-MgGraphRequest -Method POST -Uri $installUri -Body $body -ContentType "application/json"
    Write-Host "✓ Successfully installed SPARK Prompts!" -ForegroundColor Green
    Write-Host "  You can now use it in Microsoft Teams and Copilot!" -ForegroundColor Green
} catch {
    if ($_.Exception.Message -like "*already exists*") {
        Write-Host "✓ SPARK Prompts is already installed for your account!" -ForegroundColor Yellow
    } else {
        Write-Host "✗ Installation failed: $_" -ForegroundColor Red
        throw
    }
}

Disconnect-MgGraph
