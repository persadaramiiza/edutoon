param(
  [string]$Namespace = 'edutoon-benchmark',
  [string]$GrafanaUrl = 'http://localhost:3001',
  [ValidateRange(300, 28800)]
  [int]$TokenLifetimeSeconds = 28800,
  [switch]$ProbeOnly
)

$ErrorActionPreference = 'Stop'
$context = kubectl config current-context
if ($LASTEXITCODE -ne 0 -or $context -ne 'docker-desktop') {
  throw "Refusing Grafana MCP startup: current Kubernetes context is '$context', expected 'docker-desktop'."
}

$encodedPassword = kubectl get secret edutoon-runtime `
  -n $Namespace `
  -o jsonpath='{.data.GRAFANA_ADMIN_PASSWORD}'
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($encodedPassword)) {
  throw 'Unable to read the local Grafana admin password from edutoon-runtime.'
}

$adminPassword = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($encodedPassword))
$basicValue = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("admin:$adminPassword"))
$adminHeaders = @{ Authorization = "Basic $basicValue" }
$serviceAccountName = 'edutoon-universal-benchmark'

$search = Invoke-RestMethod `
  -Uri "$GrafanaUrl/api/serviceaccounts/search?query=$serviceAccountName" `
  -Headers $adminHeaders `
  -TimeoutSec 10
$account = @($search.serviceAccounts) | Where-Object name -eq $serviceAccountName | Select-Object -First 1
if ($null -eq $account) {
  throw "Required Grafana Viewer service account '$serviceAccountName' does not exist. Run the explicit one-time local setup first."
}

$tokenName = "desktop-local-$([DateTime]::UtcNow.ToString('yyyyMMddHHmmss'))"
$created = Invoke-RestMethod `
  -Method Post `
  -Uri "$GrafanaUrl/api/serviceaccounts/$($account.id)/tokens" `
  -Headers $adminHeaders `
  -ContentType 'application/json' `
  -Body (@{ name = $tokenName; secondsToLive = $TokenLifetimeSeconds } | ConvertTo-Json) `
  -TimeoutSec 10

try {
  Invoke-RestMethod `
    -Uri "$GrafanaUrl/api/datasources/uid/prometheus" `
    -Headers @{ Authorization = "Bearer $($created.key)" } `
    -TimeoutSec 10 | Out-Null

  if (-not $ProbeOnly) {
    $env:GRAFANA_URL = $GrafanaUrl
    $env:GRAFANA_SERVICE_ACCOUNT_TOKEN = $created.key
    & uvx mcp-grafana --disable-write --enabled-tools=datasource,prometheus
    exit $LASTEXITCODE
  }
} finally {
  if ($null -ne $created.id) {
    try {
      Invoke-RestMethod `
        -Method Delete `
        -Uri "$GrafanaUrl/api/serviceaccounts/$($account.id)/tokens/$($created.id)" `
        -Headers $adminHeaders `
        -TimeoutSec 10 | Out-Null
    } catch {
      Write-Error 'Failed to revoke the temporary local Grafana token.'
    }
  }
  $env:GRAFANA_SERVICE_ACCOUNT_TOKEN = $null
  $adminPassword = $null
  $basicValue = $null
  $encodedPassword = $null
  $created = $null
}
