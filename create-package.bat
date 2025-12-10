@echo off
echo Creating deployment package...

REM Clean
if exist "deploy" rmdir /s /q "deploy"
if exist "canhohanghieu.zip" del /q "canhohanghieu.zip"

REM Create folders
mkdir "deploy"
mkdir "deploy\.next"
mkdir "deploy\public"
mkdir "deploy\prisma"

REM Copy .next
xcopy /s /e /i /q ".next\server" "deploy\.next\server\" >nul
xcopy /s /e /i /q ".next\static" "deploy\.next\static\" >nul
copy /y ".next\*.json" "deploy\.next\" >nul

REM Copy public
xcopy /s /e /i /q "public" "deploy\public\" >nul

REM Copy prisma
copy /y "prisma\schema.prisma" "deploy\prisma\" >nul

REM Copy root files
copy /y "server.js" "deploy\" >nul
copy /y "package.json" "deploy\" >nul
copy /y "next.config.ts" "deploy\" >nul
copy /y ".env" "deploy\" >nul
if exist "embeddings.db.json" copy /y "embeddings.db.json" "deploy\" >nul

REM Create ZIP
echo Creating ZIP...
powershell -command "Compress-Archive -Path 'deploy\*' -DestinationPath 'canhohanghieu.zip' -Force"

echo.
echo DONE!
for %%A in (canhohanghieu.zip) do echo File: canhohanghieu.zip (%%~zA bytes)
echo.
pause
