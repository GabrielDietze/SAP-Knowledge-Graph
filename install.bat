@echo off
echo Instalando dependencias...

echo [1/2] Backend...
cd backend
npm install
cd ..

echo [2/2] Frontend...
cd frontend
npm install
cd ..

echo.
echo Populando banco de dados com dados iniciais SAP...
cd backend
node src/db/seed.js
cd ..

echo.
echo Instalacao concluida! Execute start.bat para iniciar.
pause
