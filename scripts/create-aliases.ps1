$ErrorActionPreference = "Stop"

function New-RedirectTree {
    param(
        [Parameter(Mandatory = $true)][string]$SourceDir,
        [Parameter(Mandatory = $true)][string]$TargetPrefix
    )

    if (-not (Test-Path $SourceDir)) {
        return
    }

    Get-ChildItem -Path $SourceDir -Recurse -File -Filter *.html | ForEach-Object {
        $fullPath = $_.FullName.Replace('\', '/')
        $relative = $fullPath -replace '^.*?/docs/', ''
        $aliasPath = Join-Path "docs" $TargetPrefix
        $aliasPath = Join-Path $aliasPath $relative

        $targetPath = "/" + $relative.Replace('\', '/')
        $aliasDir = Split-Path -Parent $aliasPath

        New-Item -ItemType Directory -Force -Path $aliasDir | Out-Null

        $html = @"
<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="refresh" content="0; url=$targetPath">
    <link rel="canonical" href="$targetPath">
    <title>Redirect</title>
  </head>
  <body>
    <p>Weiterleitung zu <a href="$targetPath">$targetPath</a></p>
  </body>
</html>
"@

        Set-Content -Path $aliasPath -Value $html -Encoding UTF8
    }
}

New-Item -ItemType Directory -Force -Path "docs/dev" | Out-Null

New-RedirectTree -SourceDir "docs/4.x" -TargetPrefix "dev"
New-RedirectTree -SourceDir "docs/5.x" -TargetPrefix "dev"
