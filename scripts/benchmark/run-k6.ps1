param(
  [ValidateSet('Smoke', 'Baseline')]
  [string]$Mode = 'Smoke',
  [string]$Namespace = 'edutoon-benchmark'
)

$ErrorActionPreference = 'Stop'
function Assert-NativeSuccess([string]$Action) {
  if ($LASTEXITCODE -ne 0) { throw "$Action failed with exit code $LASTEXITCODE." }
}
$context = kubectl config current-context
if ($context -ne 'docker-desktop') {
  throw "Refusing k6 execution: current Kubernetes context is '$context', expected 'docker-desktop'."
}
$repo = Resolve-Path (Join-Path $PSScriptRoot '..\..')

foreach ($deployment in @('edutoon-backend', 'edutoon-frontend', 'edutoon-prometheus', 'edutoon-grafana')) {
  kubectl rollout status "deployment/$deployment" -n $Namespace --timeout=60s
  Assert-NativeSuccess "$deployment rollout"
}

kubectl create configmap edutoon-k6-scripts -n $Namespace `
  --from-file="common.js=$(Join-Path $repo 'benchmark\k6\common.js')" `
  --from-file="smoke.js=$(Join-Path $repo 'benchmark\k6\smoke.js')" `
  --from-file="baseline.js=$(Join-Path $repo 'benchmark\k6\baseline.js')" `
  --dry-run=client -o yaml | kubectl apply -f - | Out-Null
Assert-NativeSuccess 'k6 script ConfigMap apply'

if ($Mode -eq 'Baseline') {
  kubectl get configmap edutoon-smoke-status -n $Namespace | Out-Null
  Assert-NativeSuccess 'Smoke success marker check'
  $job = 'edutoon-k6-baseline'
  $manifest = Join-Path $repo 'k8s\jobs\k6-baseline-job.yaml'
} else {
  $job = 'edutoon-k6-smoke'
  $manifest = Join-Path $repo 'k8s\jobs\k6-smoke-job.yaml'
}

kubectl delete job $job -n $Namespace --ignore-not-found | Out-Null
kubectl apply -f $manifest
Assert-NativeSuccess "$job apply"
try {
  $deadline = [DateTime]::UtcNow.AddMinutes(4)
  do {
    $failed = kubectl get job $job -n $Namespace -o jsonpath='{.status.failed}'
    Assert-NativeSuccess "$job failed status check"
    $succeeded = kubectl get job $job -n $Namespace -o jsonpath='{.status.succeeded}'
    Assert-NativeSuccess "$job succeeded status check"
    if ($failed -and [int]$failed -gt 0) { throw "$job failed." }
    if ($succeeded -and [int]$succeeded -gt 0) { break }
    Start-Sleep -Seconds 2
  } while ([DateTime]::UtcNow -lt $deadline)
  if (-not $succeeded -or [int]$succeeded -lt 1) { throw "$job did not complete within four minutes." }
} finally {
  kubectl logs "job/$job" -n $Namespace
  Assert-NativeSuccess "$job logs"
}

if ($Mode -eq 'Smoke') {
  kubectl create configmap edutoon-smoke-status -n $Namespace `
    --from-literal="passedAt=$([DateTime]::UtcNow.ToString('o'))" `
    --dry-run=client -o yaml | kubectl apply -f - | Out-Null
  Assert-NativeSuccess 'Smoke success marker apply'
}
