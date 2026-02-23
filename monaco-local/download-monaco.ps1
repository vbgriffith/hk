# ============================================================
# download-monaco.ps1
# Downloads Monaco Editor from jsDelivr for Windows users.
# Run this ONCE while online — then index-offline.html works forever.
#
# Usage (PowerShell):
#   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
#   .\download-monaco.ps1
# ============================================================

$BASE = "https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs"
$OUT  = ".\vs"

Write-Host ""
Write-Host "  Monaco Editor - Offline Download (Windows)" -ForegroundColor Cyan
Write-Host "  ============================================" -ForegroundColor Cyan
Write-Host "  Downloading from: $BASE"
Write-Host "  Saving to:        $OUT"
Write-Host ""

$files = @(
  "loader.js",
  "editor/editor.main.js",
  "editor/editor.main.css",
  "editor/editor.main.nls.js",
  "base/worker/workerMain.js",
  "base/common/worker/simpleWorker.nls.js",
  "language/typescript/tsMode.js",
  "language/typescript/tsWorker.js",
  "language/typescript/lib/typescriptServices.js",
  "language/css/cssMode.js",
  "language/css/cssWorker.js",
  "language/html/htmlMode.js",
  "language/html/htmlWorker.js",
  "language/json/jsonMode.js",
  "language/json/jsonWorker.js"
)

$total = $files.Count
$done  = 0

foreach ($file in $files) {
  $url  = "$BASE/$file"
  $dest = Join-Path $OUT $file.Replace("/", "\")
  $dir  = Split-Path $dest -Parent

  if (-not (Test-Path $dir)) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
  }

  try {
    Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing
    $done++
    Write-Host ("  [{0,2}/{1}] OK  {2}" -f $done, $total, $file) -ForegroundColor Green
  } catch {
    Write-Host ("  [{0,2}/{1}] ERR {2}: {3}" -f $done, $total, $file, $_.Exception.Message) -ForegroundColor Red
  }
}

# Patch index.html for local paths
Write-Host ""
Write-Host "  Patching index.html for local paths..." -ForegroundColor Yellow

$content = Get-Content -Path ".\index.html" -Raw
$patched = $content -replace "https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs", "./vs"
Set-Content -Path ".\index-offline.html" -Value $patched

$fileCount = (Get-ChildItem $OUT -Recurse -File).Count
Write-Host ""
Write-Host "  Done! $fileCount files downloaded." -ForegroundColor Green
Write-Host ""
Write-Host "  Open index-offline.html in your browser." -ForegroundColor Cyan
Write-Host "  No internet connection required." -ForegroundColor Cyan
Write-Host ""
