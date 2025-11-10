@echo off
echo Fechando Edge...
taskkill /F /IM msedge.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo Abrindo Edge em modo desenvolvimento...
start msedge.exe --disable-features=BlockInsecurePrivateNetworkRequests --new-window http://localhost:3000

echo Edge aberto! Aguarde alguns segundos...
timeout /t 3 /nobreak >nul

