Write-Host "======================================" -ForegroundColor Cyan
Write-Host " Iniciando Gestao Documental - Engcelin" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

$clientDir = Join-Path $PSScriptRoot "client"
$serverDir = Join-Path $PSScriptRoot "server"

Write-Host "[1/2] Compilando frontend..." -ForegroundColor Yellow
Push-Location $clientDir
npm run build
Pop-Location

Write-Host "[2/2] Iniciando servidor (porta 3001)..." -ForegroundColor Yellow
Push-Location $serverDir
npm run start
Pop-Location
