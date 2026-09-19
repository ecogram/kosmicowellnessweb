# ============================================================
# deploy-to-ec2.ps1  —  EC2 pe latest backend code deploy karo
# Usage: .\deploy-to-ec2.ps1 -KeyPath "C:\path\to\kosmico-key.pem"
# ============================================================

param(
    [Parameter(Mandatory=$false)]
    [string]$KeyPath = "kosmico-key.pem",
    
    [string]$Host = "3.7.180.215",
    [string]$User = "ec2-user",
    [string]$AppDir = "/home/ec2-user/app"
)

$ErrorActionPreference = "Stop"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Kosmico EC2 Backend Deployment Script" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check SSH is available
if (-not (Get-Command ssh -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: SSH not found. Windows OpenSSH install karo." -ForegroundColor Red
    exit 1
}

# Check key file exists
if (-not (Test-Path $KeyPath)) {
    Write-Host "ERROR: Key file nahi mila: $KeyPath" -ForegroundColor Red
    Write-Host "Usage: .\deploy-to-ec2.ps1 -KeyPath 'C:\path\to\kosmico-key.pem'" -ForegroundColor Yellow
    exit 1
}

$sshArgs = @("-i", $KeyPath, "-o", "StrictHostKeyChecking=no", "-o", "ConnectTimeout=15")
$remote = "${User}@${Host}"

Write-Host "Connecting to $remote ..." -ForegroundColor Yellow

# Step 1: Check which folder has the app
Write-Host "`n[1/5] Finding app directory..." -ForegroundColor Cyan
$findCmd = "ls /home/ec2-user/app/src 2>/dev/null && echo 'src_exists' || (ls /home/ec2-user/app/ 2>/dev/null && echo 'app_exists') || echo 'not_found'"
$result = ssh @sshArgs $remote $findCmd
Write-Host "  Result: $result"

# Determine actual paths
$srcDir = "$AppDir/src"
$hasGit = ssh @sshArgs $remote "test -d $AppDir/.git && echo yes || echo no"
Write-Host "  Has git: $hasGit"

# Step 2: Copy files directly via SCP (safest approach — no git needed on server)
Write-Host "`n[2/5] Copying updated backend files to EC2..." -ForegroundColor Cyan

$localBase = Split-Path $PSScriptRoot -Leaf
$files = @(
    @{ Local = "backend\routes\authRoutes.js";        Remote = "$srcDir/routes/authRoutes.js" },
    @{ Local = "backend\controllers\authController.js"; Remote = "$srcDir/controllers/authController.js" },
    @{ Local = "backend\services\authService.js";      Remote = "$srcDir/services/authService.js" }
)

# Try SRC path first, fall back to app root
foreach ($file in $files) {
    $localPath = Join-Path $PSScriptRoot $file.Local
    if (-not (Test-Path $localPath)) {
        Write-Host "  SKIP (not found locally): $localPath" -ForegroundColor Yellow
        continue
    }
    
    # Try /src/ path first
    Write-Host "  Copying: $($file.Local) -> EC2:$($file.Remote)"
    $scpResult = scp @("-i", $KeyPath, "-o", "StrictHostKeyChecking=no") $localPath "${remote}:$($file.Remote)" 2>&1
    if ($LASTEXITCODE -ne 0) {
        # Try without /src/
        $altRemote = $file.Remote -replace "/src/", "/"
        Write-Host "    Trying alt path: $altRemote" -ForegroundColor Yellow
        scp @("-i", $KeyPath, "-o", "StrictHostKeyChecking=no") $localPath "${remote}:${altRemote}"
    }
}

# Step 3: Also try git pull if git is available
if ($hasGit -eq "yes") {
    Write-Host "`n[3/5] Running git pull on EC2..." -ForegroundColor Cyan
    ssh @sshArgs $remote "cd $AppDir && git pull origin main 2>&1 | tail -5"
} else {
    Write-Host "`n[3/5] No git on server — using SCP copy (done above)" -ForegroundColor Yellow
}

# Step 4: Restart the Node server
Write-Host "`n[4/5] Restarting backend server..." -ForegroundColor Cyan
$restartCmd = @"
if command -v pm2 &>/dev/null; then
    echo 'Using PM2...'
    pm2 restart all && pm2 list
elif command -v forever &>/dev/null; then
    echo 'Using forever...'
    forever restartall
else
    echo 'No PM2/forever found. Checking for running node process...'
    pkill -f 'node.*server' && sleep 2
    cd $AppDir && nohup node server.js &>/tmp/server.log & echo 'Server restarted with PID: '$!
fi
"@
ssh @sshArgs $remote $restartCmd

# Step 5: Verify routes are live
Write-Host "`n[5/5] Verifying routes on live server..." -ForegroundColor Cyan
Start-Sleep -Seconds 5  # Wait for server to restart

$testRoutes = @(
    "PUT /api/auth/profile-picture",
    "POST /api/auth/profile-picture", 
    "PUT /api/auth/profile"
)

foreach ($route in $testRoutes) {
    $method, $path = $route -split " ", 2
    try {
        $resp = Invoke-WebRequest -Uri "https://api.kosmicowellness.com$path" -Method $method -Body "{}" -ContentType "application/json" -UseBasicParsing -ErrorAction SilentlyContinue
        $status = $resp.StatusCode
    } catch {
        $status = $_.Exception.Response.StatusCode.Value__
    }
    $icon = if ($status -eq 401) { "✅" } elseif ($status -eq 404) { "❌" } else { "⚠️" }
    Write-Host "  $icon $method $path => $status" -ForegroundColor $(if ($status -eq 401) { "Green" } elseif ($status -eq 404) { "Red" } else { "Yellow" })
}

Write-Host "`n============================================" -ForegroundColor Green
Write-Host "  Deployment Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
