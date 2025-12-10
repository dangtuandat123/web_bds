@echo off
echo ========================================
echo   TAO PACKAGE CHO DIRECTADMIN NODEJS
echo ========================================
echo.

REM Clean
if exist "directadmin-deploy" rmdir /s /q "directadmin-deploy"
if exist "canhohanghieu-directadmin.zip" del /q "canhohanghieu-directadmin.zip"

REM Create structure
echo [1/8] Tao thu muc...
mkdir "directadmin-deploy"
mkdir "directadmin-deploy\.next"
mkdir "directadmin-deploy\public"
mkdir "directadmin-deploy\prisma"

REM Copy .next (QUAN TRONG!)
echo [2/8] Copy Next.js build...
xcopy /s /e /i /q ".next\server" "directadmin-deploy\.next\server\" >nul
xcopy /s /e /i /q ".next\static" "directadmin-deploy\.next\static\" >nul
copy /y ".next\*.json" "directadmin-deploy\.next\" >nul 2>nul

REM Copy public
echo [3/8] Copy public files...
xcopy /s /e /i /q "public" "directadmin-deploy\public\" >nul

REM Copy prisma
echo [4/8] Copy prisma...
copy /y "prisma\schema.prisma" "directadmin-deploy\prisma\" >nul

REM Copy root files
echo [5/8] Copy server files...
copy /y "server.js" "directadmin-deploy\" >nul
copy /y "package.json" "directadmin-deploy\" >nul
copy /y "next.config.ts" "directadmin-deploy\" >nul

REM Create .env production
echo [6/8] Tao .env...
(
echo # Production Database for canhohanghieu.com
echo DATABASE_URL="mysql://hcef73f2fe_wp_canhohanghieu_com:YYj37zqEHGjgWAQubXxz@localhost:3306/hcef73f2fe_wp_canhohanghieu_com"
echo.
echo # JWT Secret
echo JWT_SECRET="kX9mP2vL8qR5wT3nY7jB0aF6hD4cG1eZ"
echo.
echo # Production Environment
echo NODE_ENV="production"
echo.
echo # Server Config
echo PORT=3000
echo HOSTNAME="0.0.0.0"
) > "directadmin-deploy\.env"

REM Copy embeddings if exists
if exist "embeddings.db.json" copy /y "embeddings.db.json" "directadmin-deploy\" >nul

REM Create README
echo [7/8] Tao huong dan...
(
echo ================================================
echo   FILES CHO DIRECTADMIN NODEJS SELECTOR
echo ================================================
echo.
echo CAC BUOC DEPLOY:
echo.
echo 1. Upload ZIP vao: public_html/app/
echo 2. Extract ZIP
echo 3. DirectAdmin -^> Setup Node.js App
echo    - Node: 20.x
echo    - Root: /home/hcef73f2fe/domains/canhohanghieu.com/public_html/app
echo    - Startup: server.js
echo 4. SSH: npm install --production
echo 5. SSH: npx prisma generate
echo 6. SSH: npx prisma db push
echo 7. SSH: chmod 777 public/uploads
echo 8. DirectAdmin -^> START
echo.
echo QUAN TRONG: 
echo - KHONG upload node_modules
echo - DirectAdmin se tu tao node_modules
echo.
) > "directadmin-deploy\README.txt"

REM Create ZIP
echo [8/8] Tao ZIP file...
powershell -command "Compress-Archive -Path 'directadmin-deploy\*' -DestinationPath 'canhohanghieu-directadmin.zip' -Force"

REM Summary
echo.
echo ========================================
echo   HOAN TAT!
echo ========================================
for %%A in (canhohanghieu-directadmin.zip) do (
    echo File: canhohanghieu-directadmin.zip
    echo Size: %%~zA bytes
)
echo.
echo NOI DUNG PACKAGE:
echo   [+] .next/server/       - Next.js server code
echo   [+] .next/static/       - Static assets
echo   [+] public/             - Public files
echo   [+] prisma/schema.prisma - Database schema
echo   [+] server.js           - Production server
echo   [+] package.json        - Dependencies
echo   [+] next.config.ts      - Next.js config
echo   [+] .env                - Database credentials
echo   [+] embeddings.db.json  - AI data
echo.
echo KHONG CO:
echo   [-] node_modules        - DirectAdmin se tu tao!
echo.
echo UPLOAD FILE: canhohanghieu-directadmin.zip
echo.
pause
