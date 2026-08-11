param(
  [string]$BackendImage = 'edutoon-backend:local',
  [string]$FrontendImage = 'edutoon-frontend:local'
)

$ErrorActionPreference = 'Stop'
$repo = Resolve-Path (Join-Path $PSScriptRoot '..\..')

docker build --tag $BackendImage --file (Join-Path $repo 'Dockerfile') $repo
if ($LASTEXITCODE -ne 0) { throw "Backend image build failed with exit code $LASTEXITCODE." }
docker build --tag $FrontendImage --file (Join-Path $repo 'frontend\Dockerfile') (Join-Path $repo 'frontend')
if ($LASTEXITCODE -ne 0) { throw "Frontend image build failed with exit code $LASTEXITCODE." }

Write-Host "Built $BackendImage and $FrontendImage."
