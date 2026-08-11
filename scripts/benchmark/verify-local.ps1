param(
  [string]$Namespace = 'edutoon-benchmark'
)

$ErrorActionPreference = 'Stop'
function Assert-NativeSuccess([string]$Action) {
  if ($LASTEXITCODE -ne 0) { throw "$Action failed with exit code $LASTEXITCODE." }
}
foreach ($workload in @(
  'statefulset/edutoon-postgres',
  'deployment/edutoon-backend',
  'deployment/edutoon-frontend',
  'deployment/edutoon-prometheus',
  'deployment/edutoon-grafana'
)) {
  kubectl rollout status $workload -n $Namespace --timeout=60s
  Assert-NativeSuccess "$workload rollout"
}

$health = kubectl exec -n $Namespace deployment/edutoon-prometheus -- `
  wget -qO- http://edutoon-backend:3000/api/health
Assert-NativeSuccess 'Backend health request'
if ($health -notmatch '"status":"ok"') { throw 'Backend health check did not return status ok.' }

$ping = kubectl exec -n $Namespace deployment/edutoon-prometheus -- `
  wget -qO- http://edutoon-frontend:3333/healthz
Assert-NativeSuccess 'Frontend health request'
if ($ping -notmatch '"status":"ok"') { throw 'Frontend health check did not return status ok.' }

$prometheus = kubectl exec -n $Namespace deployment/edutoon-prometheus -- `
  wget -qO- 'http://127.0.0.1:9090/api/v1/query?query=up%7Bjob%3D%22edutoon-backend%22%7D'
Assert-NativeSuccess 'Prometheus query'
if ($prometheus -notmatch '"value":\[[^]]+,"1"\]') { throw 'Prometheus does not report the backend target as up.' }

$grafana = kubectl exec -n $Namespace deployment/edutoon-grafana -- sh -ec `
  'curl -fsS -u "admin:$GF_SECURITY_ADMIN_PASSWORD" http://127.0.0.1:3000/api/datasources/uid/prometheus/health'
Assert-NativeSuccess 'Grafana datasource query'
if ($grafana -notmatch 'success|Successfully') { throw 'Grafana datasource health check failed.' }

Write-Host 'Readiness, backend database health, frontend health, Prometheus scrape, and Grafana datasource checks passed.'
kubectl get pods -n $Namespace
