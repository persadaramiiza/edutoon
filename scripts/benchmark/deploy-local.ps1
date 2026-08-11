param(
  [string]$Namespace = 'edutoon-benchmark'
)

$ErrorActionPreference = 'Stop'
function Assert-NativeSuccess([string]$Action) {
  if ($LASTEXITCODE -ne 0) { throw "$Action failed with exit code $LASTEXITCODE." }
}
$repo = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$context = kubectl config current-context
if ($context -ne 'docker-desktop') {
  throw "Refusing deployment: current Kubernetes context is '$context', expected 'docker-desktop'."
}

kubectl apply -f (Join-Path $repo 'k8s\base\namespace.yaml')
Assert-NativeSuccess 'Namespace apply'
kubectl get secret edutoon-runtime -n $Namespace | Out-Null
Assert-NativeSuccess 'Runtime Secret check'
kubectl get secret edutoon-benchmark-account -n $Namespace | Out-Null
Assert-NativeSuccess 'Benchmark account Secret check'
kubectl apply -f (Join-Path $repo 'k8s\base\configmap.yaml')
Assert-NativeSuccess 'ConfigMap apply'
kubectl apply -f (Join-Path $repo 'k8s\base\postgres.yaml')
Assert-NativeSuccess 'PostgreSQL apply'
kubectl rollout status statefulset/edutoon-postgres -n $Namespace --timeout=180s
Assert-NativeSuccess 'PostgreSQL rollout'

kubectl delete job edutoon-migration -n $Namespace --ignore-not-found | Out-Null
kubectl apply -f (Join-Path $repo 'k8s\jobs\migration-job.yaml')
Assert-NativeSuccess 'Migration Job apply'
kubectl wait --for=condition=complete job/edutoon-migration -n $Namespace --timeout=180s
Assert-NativeSuccess 'Migration Job wait'
kubectl logs job/edutoon-migration -n $Namespace
Assert-NativeSuccess 'Migration Job logs'

kubectl delete job edutoon-benchmark-seed -n $Namespace --ignore-not-found | Out-Null
kubectl apply -f (Join-Path $repo 'k8s\jobs\benchmark-seed-job.yaml')
Assert-NativeSuccess 'Benchmark seed Job apply'
kubectl wait --for=condition=complete job/edutoon-benchmark-seed -n $Namespace --timeout=180s
Assert-NativeSuccess 'Benchmark seed Job wait'
kubectl logs job/edutoon-benchmark-seed -n $Namespace
Assert-NativeSuccess 'Benchmark seed Job logs'

kubectl apply -f (Join-Path $repo 'k8s\base\backend.yaml')
Assert-NativeSuccess 'Backend apply'
kubectl apply -f (Join-Path $repo 'k8s\base\frontend.yaml')
Assert-NativeSuccess 'Frontend apply'
kubectl apply -k (Join-Path $repo 'k8s\observability')
Assert-NativeSuccess 'Observability apply'

foreach ($deployment in @('edutoon-backend', 'edutoon-frontend', 'edutoon-prometheus', 'edutoon-grafana')) {
  kubectl rollout status "deployment/$deployment" -n $Namespace --timeout=300s
  Assert-NativeSuccess "$deployment rollout"
}

kubectl get pods -n $Namespace
