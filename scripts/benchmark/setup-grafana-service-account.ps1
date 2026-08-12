param(
  [string]$Namespace = 'edutoon-benchmark',
  [string]$GrafanaUrl = 'http://localhost:3001'
)

$ErrorActionPreference = 'Stop'
$context = kubectl config current-context
if ($LASTEXITCODE -ne 0 -or $context -ne 'docker-desktop') {
  throw "Refusing Grafana setup: current Kubernetes context is '$context', expected 'docker-desktop'."
}

$encodedPassword = kubectl get secret edutoon-runtime `
  -n $Namespace `
  -o jsonpath='{.data.GRAFANA_ADMIN_PASSWORD}'
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($encodedPassword)) {
  throw 'Unable to read the local Grafana admin password from edutoon-runtime.'
}

$adminPassword = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($encodedPassword))
$basicValue = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("admin:$adminPassword"))
$headers = @{ Authorization = "Basic $basicValue" }
$name = 'edutoon-universal-benchmark'
$search = Invoke-RestMethod `
  -Uri "$GrafanaUrl/api/serviceaccounts/search?query=$name" `
  -Headers $headers `
  -TimeoutSec 10
$account = @($search.serviceAccounts) | Where-Object name -eq $name | Select-Object -First 1

if ($null -eq $account) {
  Invoke-RestMethod `
    -Method Post `
    -Uri "$GrafanaUrl/api/serviceaccounts" `
    -Headers $headers `
    -ContentType 'application/json' `
    -Body (@{ name = $name; role = 'Viewer'; isDisabled = $false } | ConvertTo-Json) `
    -TimeoutSec 10 | Out-Null
  Write-Host "Created local Grafana Viewer service account '$name'."
} elseif ($account.role -ne 'Viewer' -or $account.isDisabled) {
  throw "Grafana service account '$name' exists but is not an enabled Viewer."
} else {
  Write-Host "Local Grafana Viewer service account '$name' is already ready."
}

$adminPassword = $null
$basicValue = $null
$encodedPassword = $null
