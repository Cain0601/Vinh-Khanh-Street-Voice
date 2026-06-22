$headers = @{ 'X-Dev-Bypass' = 'owner' }
$body = @{ price = 50000; name = @{ vi = 'Test Item' }; description = @{ vi = 'Created by Copilot mock' }; isActive = $true }
$bodyJson = $body | ConvertTo-Json -Depth 5
Write-Host 'POSTing...'
try {
    $post = Invoke-RestMethod -Uri 'http://localhost:5000/api/owner/pois/test-poi/menu-items' -Method Post -Headers $headers -Body $bodyJson -ContentType 'application/json'
    Write-Host 'POST response:'
    $post | ConvertTo-Json -Depth 5 | Write-Host
} catch {
    Write-Host 'POST ERROR:' $_.Exception.Message
    exit 1
}

Write-Host 'GETing list...'
try {
    $get = Invoke-RestMethod -Uri 'http://localhost:5000/api/owner/pois/test-poi/menu-items' -Headers $headers -Method Get
    $get | ConvertTo-Json -Depth 10 | Write-Host
} catch {
    Write-Host 'GET ERROR:' $_.Exception.Message
    exit 1
}
