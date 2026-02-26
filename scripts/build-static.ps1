$ErrorActionPreference = "Stop"

$playbook = "antora-playbook-local.yml"   # existiert bei dir
$outDir   = "docs"                         # dein playbook nutzt output.dir: ./docs
$publish  = "publish"

# Clean
if (Test-Path $outDir)  { Remove-Item $outDir -Recurse -Force }
if (Test-Path $publish) { Remove-Item $publish -Recurse -Force }

# Build
npx antora --fetch $playbook

# Publish-Mirror (optional, wenn du einen festen Ordner willst)
New-Item -ItemType Directory -Force -Path $publish | Out-Null
Copy-Item -Path "$outDir\*" -Destination $publish -Recurse -Force

Write-Host "Fertig. Öffne: $publish\index.html"
