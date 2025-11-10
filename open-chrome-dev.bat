@echo off
echo Fechando Chrome...
taskkill /F /IM chrome.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo Abrindo Chrome em modo desenvolvimento...
start chrome.exe --disable-features=BlockInsecurePrivateNetworkRequests --new-window http://localhost:3000

echo Chrome aberto! Aguarde alguns segundos...
timeout /t 3 /nobreak >nul

