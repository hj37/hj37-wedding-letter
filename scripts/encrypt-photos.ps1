$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$originalsDir = Join-Path $repoRoot 'photos/originals'
$encryptedDir = Join-Path $repoRoot 'photos/encrypted'

if (-not (Get-Command gpg -ErrorAction SilentlyContinue)) {
  throw 'GPG is required. Install GnuPG, reopen PowerShell, and run this script again.'
}

New-Item -ItemType Directory -Force -Path $originalsDir, $encryptedDir | Out-Null
$photos = @(Get-ChildItem -LiteralPath $originalsDir -File | Where-Object {
  $_.Extension -match '^\.(jpg|jpeg|png|webp)$'
})

if ($photos.Count -eq 0) {
  Write-Host "No JPG, JPEG, PNG, or WebP photos found in $originalsDir"
  exit 0
}

foreach ($photo in $photos) {
  $encryptedPath = Join-Path $encryptedDir ($photo.Name + '.gpg')
  if (Test-Path -LiteralPath $encryptedPath) {
    Write-Warning "Skipping existing encrypted file: $encryptedPath (remove it first if the source photo changed)"
    continue
  }

  Write-Host "Encrypting $($photo.Name). GPG will ask for a passphrase; use the same one for every photo."
  & gpg --symmetric --cipher-algo AES256 --output $encryptedPath $photo.FullName
  if ($LASTEXITCODE -ne 0) {
    Remove-Item -LiteralPath $encryptedPath -Force -ErrorAction SilentlyContinue
    throw "GPG failed while encrypting $($photo.Name)."
  }
}

Write-Host 'Encryption complete. Commit only files in photos/encrypted/; originals stay local.'

