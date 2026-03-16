@echo off
chcp 65001 >nul 2>&1
set "SCRIPT=%~f0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$s=[IO.File]::ReadAllText('%SCRIPT%');$block=$s.Substring($s.IndexOf(': #PS_START')+12);iex $block" %*
exit /b
: #PS_START
Write-Host 'hello'