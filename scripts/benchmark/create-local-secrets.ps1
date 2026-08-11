param(
  [string]$Namespace = 'edutoon-benchmark'
)

$ErrorActionPreference = 'Stop'
function Assert-NativeSuccess([string]$Action) {
  if ($LASTEXITCODE -ne 0) { throw "$Action failed with exit code $LASTEXITCODE." }
}
$context = kubectl config current-context
if ($context -ne 'docker-desktop') {
  throw "Refusing Secret creation: current Kubernetes context is '$context', expected 'docker-desktop'."
}
$required = @('DB_PASS', 'JWT_SECRET', 'GRAFANA_ADMIN_PASSWORD', 'BENCHMARK_EMAIL', 'BENCHMARK_PASSWORD')
foreach ($name in $required) {
  if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($name))) {
    throw "Required local environment variable is missing: $name"
  }
}

kubectl apply -f (Join-Path $PSScriptRoot '..\..\k8s\base\namespace.yaml') | Out-Null
Assert-NativeSuccess 'Namespace apply'

kubectl create secret generic edutoon-runtime `
  --namespace $Namespace `
  --from-literal="DB_PASS=$([Environment]::GetEnvironmentVariable('DB_PASS'))" `
  --from-literal="JWT_SECRET=$([Environment]::GetEnvironmentVariable('JWT_SECRET'))" `
  --from-literal="GRAFANA_ADMIN_PASSWORD=$([Environment]::GetEnvironmentVariable('GRAFANA_ADMIN_PASSWORD'))" `
  --dry-run=client -o yaml | kubectl apply -f - | Out-Null
Assert-NativeSuccess 'Runtime Secret apply'

kubectl create secret generic edutoon-benchmark-account `
  --namespace $Namespace `
  --from-literal="BENCHMARK_EMAIL=$([Environment]::GetEnvironmentVariable('BENCHMARK_EMAIL'))" `
  --from-literal="BENCHMARK_PASSWORD=$([Environment]::GetEnvironmentVariable('BENCHMARK_PASSWORD'))" `
  --dry-run=client -o yaml | kubectl apply -f - | Out-Null
Assert-NativeSuccess 'Benchmark account Secret apply'

Write-Host "Kubernetes secrets created from local environment input in namespace $Namespace."
