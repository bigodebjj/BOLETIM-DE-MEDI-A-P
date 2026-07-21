@echo off
title Gestao Documental
echo ======================================
echo  Iniciando Gestao Documental - Engcelin
echo ======================================
echo.
echo Compilando frontend...
cd /d client && npm run build
cd /d ..
echo.
echo Iniciando servidor (porta 3001)...
cd /d server && npm run start
pause
