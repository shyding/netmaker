# Netmaker 前后端一键编译脚本 (PowerShell 版本)
# 作者: Claude
# 日期: 2026-02-28

# 设置错误时停止
$ErrorActionPreference = "Stop"

# 颜色函数
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Success { Write-ColorOutput Green $args }
function Write-Warning { Write-ColorOutput Yellow $args }
function Write-Error { Write-ColorOutput Red $args }

# 项目路径
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Join-Path $ProjectRoot "netmaker"
$FrontendDir = Join-Path $ProjectRoot "netmaker-ui"
$BuildOutputDir = Join-Path $ProjectRoot "build"

Write-Success "========================================"
Write-Success "Netmaker 前后端一键编译脚本"
Write-Success "========================================"
Write-Output ""

# 清理旧的构建输出
Write-Warning "[1/5] 清理旧的构建文件..."
if (Test-Path $BuildOutputDir) {
    Remove-Item -Recurse -Force $BuildOutputDir
}
New-Item -ItemType Directory -Path "$BuildOutputDir\backend" -Force | Out-Null
New-Item -ItemType Directory -Path "$BuildOutputDir\frontend" -Force | Out-Null

# 编译后端
Write-Output ""
Write-Warning "[2/5] 编译后端 (Go)..."
Set-Location $BackendDir

# 检查 Go 是否安装
if (-not (Get-Command "go" -ErrorAction SilentlyContinue)) {
    Write-Error "错误: 未找到 Go 编译器，请先安装 Go"
    Read-Host "按回车键退出"
    exit 1
}

Write-Output "Go 版本: $(go version)"
Write-Output "正在下载依赖..."
go mod download

Write-Output "正在编译后端..."
$env:CGO_ENABLED = "1"
go build -ldflags="-s -w" -o "$BuildOutputDir\backend\netmaker.exe" .

if (-not (Test-Path "$BuildOutputDir\backend\netmaker.exe")) {
    Write-Error "错误: 后端编译失败"
    Read-Host "按回车键退出"
    exit 1
}
Write-Success "✓ 后端编译成功"

# 复制后端配置文件
if (Test-Path "$BackendDir\config") {
    Copy-Item -Recurse -Force "$BackendDir\config" "$BuildOutputDir\backend\"
    Write-Output "已复制配置文件"
}

# 编译前端
Write-Output ""
Write-Warning "[3/5] 编译前端 (React)..."
Set-Location $FrontendDir

# 检查 Node.js 是否安装
if (-not (Get-Command "node" -ErrorAction SilentlyContinue)) {
    Write-Error "错误: 未找到 Node.js，请先安装 Node.js"
    Read-Host "按回车键退出"
    exit 1
}

Write-Output "Node 版本: $(node --version)"
Write-Output "npm 版本: $(npm --version)"

# 安装依赖
if (-not (Test-Path "node_modules")) {
    Write-Output "正在安装前端依赖..."
    npm install
} else {
    Write-Output "依赖已存在，跳过安装"
}

# 构建前端
Write-Output "正在编译前端..."
$env:NODE_OPTIONS = "--openssl-legacy-provider"
npm run build

if (-not (Test-Path "$FrontendDir\build")) {
    Write-Error "错误: 前端编译失败"
    Read-Host "按回车键退出"
    exit 1
}

Copy-Item -Recurse -Force "$FrontendDir\build\*" "$BuildOutputDir\frontend\"
Write-Success "✓ 前端编译成功"

# 生成配置文件
Write-Output ""
Write-Warning "[4/5] 生成配置文件..."

# 生成后端配置
@"
# Netmaker 后端配置
SERVER_HOST=0.0.0.0
API_PORT=8081
MASTER_KEY=your-secret-key-here
DATABASE=sqlite
SQL_CONN=netmaker.db
CORS_ALLOWED_ORIGIN=http://localhost:3000
SERVER_HTTP_HOST=http://localhost:8081
"@ | Out-File -FilePath "$BuildOutputDir\backend\server.env" -Encoding UTF8

# 生成前端配置
@"
window.REACT_APP_BACKEND = "http://localhost:8081";
"@ | Out-File -FilePath "$BuildOutputDir\frontend\config.js" -Encoding UTF8

# 生成启动脚本
Write-Output ""
Write-Warning "[5/5] 生成启动脚本..."

# 后端启动脚本 (PowerShell)
@'
# Netmaker 后端启动脚本
$BackendDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$BackendDir\backend"

Write-Host "正在启动 Netmaker 后端服务..." -ForegroundColor Green
Write-Host "API 地址: http://localhost:8081" -ForegroundColor Cyan
Write-Host ""
Write-Host "按 Ctrl+C 停止服务" -ForegroundColor Yellow
Write-Host ""

# 加载环境变量
Get-Content "server.env" | ForEach-Object {
    if ($_ -match '^([^#][^=]+)=(.*)$') {
        [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
    }
}

# 启动后端
.\netmaker.exe
'@ | Out-File -FilePath "$BuildOutputDir\start-backend.ps1" -Encoding UTF8

# 前端启动脚本 (PowerShell)
@'
# Netmaker 前端启动脚本
$FrontendDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$FrontendDir\frontend"

$Port = 3000

Write-Host "正在启动 Netmaker 前端服务..." -ForegroundColor Green
Write-Host "访问地址: http://localhost:$Port" -ForegroundColor Cyan
Write-Host ""
Write-Host "按 Ctrl+C 停止服务" -ForegroundColor Yellow
Write-Host ""

# 尝试使用不同的 HTTP 服务器
if (Get-Command "python" -ErrorAction SilentlyContinue) {
    python -m http.server $Port
} elseif (Get-Command "python3" -ErrorAction SilentlyContinue) {
    python3 -m http.server $Port
} elseif (Get-Command "php" -ErrorAction SilentlyContinue) {
    php -S localhost:$Port
} else {
    Write-Host "错误: 未找到 Python 或 PHP，无法启动 HTTP 服务器" -ForegroundColor Red
    Write-Host "请安装 Python 或使用其他 Web 服务器" -ForegroundColor Yellow
    Read-Host "按回车键退出"
    exit 1
}
'@ | Out-File -FilePath "$BuildOutputDir\start-frontend.ps1" -Encoding UTF8

# 一键启动脚本 (PowerShell)
@'
# Netmaker 一键启动脚本
$BuildDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=========================================" -ForegroundColor Green
Write-Host "启动 Netmaker 前后端服务" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "后端 API: http://localhost:8081" -ForegroundColor Cyan
Write-Host "前端界面: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "提示: 后端将在新窗口启动" -ForegroundColor Yellow
Write-Host "      关闭前端窗口时，请手动关闭后端窗口" -ForegroundColor Yellow
Write-Host ""
Read-Host "按回车键继续"

# 在新窗口启动后端
Start-Process powershell -ArgumentList "-NoExit", "-File", "$BuildDir\start-backend.ps1"

# 等待后端启动
Start-Sleep -Seconds 3

# 启动前端
& "$BuildDir\start-frontend.ps1"
'@ | Out-File -FilePath "$BuildOutputDir\start-all.ps1" -Encoding UTF8

# 完成
Write-Output ""
Write-Success "========================================"
Write-Success "编译完成！"
Write-Success "========================================"
Write-Output ""
Write-Output "构建输出目录: $BuildOutputDir"
Write-Output ""
Write-Output "目录结构:"
Write-Output "  build\"
Write-Output "  ├── backend\          # 后端可执行文件"
Write-Output "  │   ├── netmaker.exe  # 后端程序"
Write-Output "  │   └── server.env    # 后端配置"
Write-Output "  ├── frontend\         # 前端静态文件"
Write-Output "  │   └── config.js     # 前端配置"
Write-Output "  ├── start-backend.ps1 # 启动后端"
Write-Output "  ├── start-frontend.ps1# 启动前端"
Write-Output "  └── start-all.ps1     # 一键启动前后端"
Write-Output ""
Write-Warning "使用方法:"
Write-Output "  1. 启动所有服务 (PowerShell):"
Write-Output "     cd build"
Write-Output "     .\start-all.ps1"
Write-Output ""
Write-Output "  2. 分别启动:"
Write-Output "     cd build"
Write-Output "     .\start-backend.ps1   # 启动后端"
Write-Output "     .\start-frontend.ps1  # 启动前端"
Write-Output ""
Write-Warning "访问地址:"
Write-Output "  前端: http://localhost:3000"
Write-Output "  后端: http://localhost:8081"
Write-Output ""
Write-Warning "注意事项:"
Write-Output "  - 首次运行需要配置 MASTER_KEY 和数据库"
Write-Output "  - 修改配置请编辑 build\backend\server.env"
Write-Output "  - 如需修改前端 API 地址，编辑 build\frontend\config.js"
Write-Output "  - 如果遇到执行策略错误，请以管理员身份运行:"
Write-Output "    Set-ExecutionPolicy RemoteSigned -Scope CurrentUser"
Write-Output ""
Read-Host "按回车键退出"
