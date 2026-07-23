@echo off
setlocal

powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0firewall.ps1" %*
exit /b %ERRORLEVEL%
