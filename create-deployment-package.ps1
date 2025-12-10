# DirectAdmin Deployment Package Builder
# Tạo package deployment hoàn chỉnh cho DirectAdmin CloudLinux

Write-Host "🚀 Tạo Deployment Package cho DirectAdmin..." -ForegroundColor Cyan

# Step 1: Clean
Write-Host "`n📦 Dọn dẹp thư mục cũ..." -ForegroundColor Yellow
if (Test-Path "directadmin-deployment") { Remove-Item "directadmin-deployment" -Recurse -Force }
if (Test-Path "directadmin-deployment.zip") { Remove-Item "directadmin-deployment.zip" -Force }

# Step 2: Create deployment folder
Write-Host "`n📁 Tạo thư mục deployment..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path "directadmin-deployment" -Force | Out-Null

# Step 3: Copy standalone build
Write-Host "   📋 Copy standalone build..." -ForegroundColor Gray
if (Test-Path ".next/standalone") {
    Copy-Item ".next/standalone/*" "directadmin-deployment/" -Recurse -Force
} else {
    Write-Host "❌ .next/standalone không tồn tại! Chạy 'npm run build' trước!" -ForegroundColor Red
    exit 1
}

# Step 4: Copy static files
Write-Host "   📋 Copy .next/static..." -ForegroundColor Gray
if (!(Test-Path "directadmin-deployment/.next")) {
    New-Item -ItemType Directory -Path "directadmin-deployment/.next" -Force | Out-Null
}
Copy-Item ".next/static" "directadmin-deployment/.next/" -Recurse -Force

# Step 5: Copy public folder
Write-Host "   📋 Copy public folder..." -ForegroundColor Gray
Copy-Item "public" "directadmin-deployment/" -Recurse -Force

# Step 6: Copy server.js
Write-Host "   📋 Copy server.js..." -ForegroundColor Gray
Copy-Item "server.js" "directadmin-deployment/" -Force

# Step 7: Copy prisma
Write-Host "   📋 Copy prisma folder..." -ForegroundColor Gray
Copy-Item "prisma" "directadmin-deployment/" -Recurse -Force

# Step 8: Create .env.example
Write-Host "   📋 Tạo .env.example..." -ForegroundColor Gray
$envExample = @'
# Database Connection
DATABASE_URL="mysql://username:password@localhost:3306/database_name"

# JWT Secret (generate random string)
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Production Environment
NODE_ENV="production"

# Server Configuration
PORT=3000
HOSTNAME="0.0.0.0"

# OpenRouter API (Optional - can set in Admin Settings)
OPENROUTER_API_KEY="your-openrouter-api-key"
'@
$envExample | Out-File "directadmin-deployment\.env.example" -Encoding UTF8

# Step 9: Create UPLOAD_GUIDE.txt
Write-Host "   📋 Tạo hướng dẫn upload..." -ForegroundColor Gray
$uploadGuide = @'
═══════════════════════════════════════════════════════════
  HƯỚNG DẪN UPLOAD VÀ DEPLOY LÊN DIRECTADMIN
═══════════════════════════════════════════════════════════

📋 BƯỚC 1: UPLOAD FILES
─────────────────────────────────────────────────────────

Upload TẤT CẢ files trong folder này lên:
  /home/username/domains/yourdomain.com/app/

Có thể dùng:
  - FTP/SFTP (FileZilla, WinSCP)
  - File Manager trong DirectAdmin
  - rsync (nếu có SSH access)

⚠️  QUAN TRỌNG: KHÔNG upload node_modules!


📋 BƯỚC 2: SSH VÀO SERVER
─────────────────────────────────────────────────────────

ssh username@your-server-ip


📋 BƯỚC 3: CẤU HÌNH .ENV
─────────────────────────────────────────────────────────

cd /home/username/domains/yourdomain.com/app

cp .env.example .env
nano .env

Điền thông tin:
  - DATABASE_URL: MySQL connection string
  - JWT_SECRET: Random secret key
  - NODE_ENV: production


📋 BƯỚC 4: SETUP NODE.JS APP TRONG DIRECTADMIN
─────────────────────────────────────────────────────────

DirectAdmin → Setup Node.js App → CREATE APPLICATION

Thông tin:
  - Node.js version: 20.x
  - Application mode: Production
  - Application root: /home/username/domains/yourdomain.com/app
  - Application URL: yourdomain.com
  - Application startup file: server.js

Nhấn CREATE (chưa nhấn START!)


📋 BƯỚC 5: ACTIVATE VIRTUALENV & SETUP DATABASE
─────────────────────────────────────────────────────────

source /home/username/nodevenv/domains/yourdomain.com/app/20/bin/activate

cd /home/username/domains/yourdomain.com/app

# Generate Prisma Client
npx prisma generate

# Run Database Migrations
npx prisma db push

# Set Upload Folder Permissions
chmod 777 public/uploads


📋 BƯỚC 6: START APPLICATION
─────────────────────────────────────────────────────────

DirectAdmin → Node.js → Tìm app → Nhấn START


📋 BƯỚC 7: KIỂM TRA
─────────────────────────────────────────────────────────

✓ Truy cập: https://yourdomain.com
✓ Login admin: https://yourdomain.com/login
✓ Test upload ảnh
✓ Test chatbot


═══════════════════════════════════════════════════════════
  TROUBLESHOOTING
═══════════════════════════════════════════════════════════

Lỗi "Cannot find module 'next'":
  → Chạy lại: source .../activate && npm install

Lỗi Database connection:
  → Kiểm tra DATABASE_URL trong .env

Lỗi 503 Service Unavailable:
  → Xem logs: DirectAdmin → Node.js → View Logs
  → Hoặc: cat ~/nodevenv/.../logs/app.log

Images không hiển thị:
  → chmod 777 public/uploads
  → Kiểm tra path ảnh đúng chưa


═══════════════════════════════════════════════════════════
🎉 CHÚC MỪNG! ỨNG DỤNG ĐÃ SẴN SÀNG!
═══════════════════════════════════════════════════════════
'@
$uploadGuide | Out-File "directadmin-deployment\UPLOAD_GUIDE.txt" -Encoding UTF8

# Step 10: Create deployment info
Write-Host "   📋 Tạo deployment info..." -ForegroundColor Gray
$deploymentInfo = @"
Build Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Node.js Version Required: 20.x
Platform: DirectAdmin CloudLinux
Output Mode: Standalone
"@
$deploymentInfo | Out-File "directadmin-deployment\BUILD_INFO.txt" -Encoding UTF8

# Step 11: Create ZIP
Write-Host "`n📦 Tạo file ZIP..." -ForegroundColor Yellow
Compress-Archive -Path "directadmin-deployment\*" -DestinationPath "directadmin-deployment.zip" -Force

# Step 12: Summary
$zipSize = [math]::Round((Get-Item "directadmin-deployment.zip").Length / 1MB, 2)
Write-Host "`n✅ HOÀN TẤT!" -ForegroundColor Green
Write-Host "   📦 File: directadmin-deployment.zip" -ForegroundColor Cyan
Write-Host "   📏 Kích thước: $zipSize MB" -ForegroundColor Cyan
Write-Host "   📁 Folder: directadmin-deployment\" -ForegroundColor Cyan
Write-Host "`n🎯 TIẾP THEO:" -ForegroundColor Yellow
Write-Host "   1. Upload directadmin-deployment.zip lên server" -ForegroundColor White
Write-Host "   2. Giải nén: unzip directadmin-deployment.zip" -ForegroundColor White
Write-Host "   3. Làm theo UPLOAD_GUIDE.txt" -ForegroundColor White
