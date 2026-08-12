param(
  [string]$NodeContainer = 'desktop-control-plane',
  [string[]]$Images = @('edutoon-backend:local', 'edutoon-frontend:local')
)

$ErrorActionPreference = 'Stop'
$context = kubectl config current-context
if ($context -ne 'docker-desktop') {
  throw "Refusing image import: current Kubernetes context is '$context', expected 'docker-desktop'."
}
$nodeId = docker ps --filter "name=^/$NodeContainer$" --format '{{.ID}}'
$tempArchive = Join-Path ([System.IO.Path]::GetTempPath()) "edutoon-images-$PID.tar"
try {
  docker save --output $tempArchive $Images
  if ($LASTEXITCODE -ne 0) { throw "docker save failed with exit code $LASTEXITCODE." }

  if (-not [string]::IsNullOrWhiteSpace($nodeId)) {
    docker cp $tempArchive "${NodeContainer}:/tmp/edutoon-images.tar"
    if ($LASTEXITCODE -ne 0) { throw "docker cp failed with exit code $LASTEXITCODE." }
    docker exec $NodeContainer ctr --namespace k8s.io images import /tmp/edutoon-images.tar
    if ($LASTEXITCODE -ne 0) { throw "containerd image import failed with exit code $LASTEXITCODE." }
  } else {
    $repo = Resolve-Path (Join-Path $PSScriptRoot '..\..')
    kubectl delete pod edutoon-image-loader -n edutoon-benchmark --ignore-not-found | Out-Null
    kubectl apply -f (Join-Path $repo 'k8s\tools\image-loader.yaml') | Out-Null
    kubectl wait --for=condition=Ready pod/edutoon-image-loader -n edutoon-benchmark --timeout=180s
    $previousLocation = Get-Location
    try {
      Set-Location (Split-Path -Parent $tempArchive)
      kubectl cp (Split-Path -Leaf $tempArchive) 'edutoon-benchmark/edutoon-image-loader:/tmp/edutoon-images.tar'
      if ($LASTEXITCODE -ne 0) { throw "kubectl cp failed with exit code $LASTEXITCODE." }
    } finally {
      Set-Location $previousLocation
    }
    kubectl exec -n edutoon-benchmark edutoon-image-loader -- `
      ctr --address /run/containerd/containerd.sock --namespace k8s.io images import /tmp/edutoon-images.tar
    if ($LASTEXITCODE -ne 0) { throw "containerd image import failed with exit code $LASTEXITCODE." }
  }
} finally {
  if ([string]::IsNullOrWhiteSpace($nodeId)) {
    kubectl delete pod edutoon-image-loader -n edutoon-benchmark --ignore-not-found | Out-Null
  }
  if (Test-Path -LiteralPath $tempArchive) {
    Remove-Item -LiteralPath $tempArchive -Force
  }
}

Write-Host "Loaded application images into $NodeContainer containerd."
