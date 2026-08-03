[CmdletBinding()]
param(
    [switch]$PushGit
)

$rootDeployScript = Join-Path $PSScriptRoot '..\deploy.ps1'

if (-not (Test-Path $rootDeployScript)) {
    throw "No se encontro script central de deploy: $rootDeployScript"
}

Write-Host "Derivando a pipeline unico: $rootDeployScript" -ForegroundColor Cyan
& $rootDeployScript @PSBoundParameters
