@echo off
TITLE PayControl Launcher
echo Verificando instalacion de Node.js...
node -v >node_version.txt 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no se detecta en esta sesion.
    echo.
    echo 1. Si acabas de instalar Node.js, DEBES CERRAR Y VOLVER A ABRIR VS Code o tu terminal.
    echo 2. Si ya lo hiciste y sigue fallando, verifica que Node.js este en tu PATH.
    echo.
    echo Descarga: https://nodejs.org/
    pause
    exit /b
)
del node_version.txt

echo Instalando dependencias (esto puede tardar un momento)...
call npm install

echo Iniciando servidor PayControl...
start http://localhost:3000
node server.js
pause
