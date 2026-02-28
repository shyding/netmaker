@echo off
chcp 65001 >nul
REM Netmaker 前后端一键编译脚本 (Windows CMD 版本)
REM 作者: Claude
REM 日期: 2026-02-28

setlocal enabledelayedexpansion

echo ========================================
echo Netmaker 前后端一键编译脚本
echo ========================================
echo.

REM 获取项目根目录
set "PROJECT_ROOT=%~dp0"
set "BACKEND_DIR=%PROJECT_ROOT%netmaker"
set "FRONTEND_DIR=%PROJECT_ROOT%netmaker-ui"
set "BUILD_OUTPUT_DIR=%PROJECT_ROOT%build"

REM 清理旧的构建输出
echo [1/5] 清理旧的构建文件...
if exist "%BUILD_OUTPUT_DIR%" (
    rmdir /s /q "%BUILD_OUTPUT_DIR%"
)
mkdir "%BUILD_OUTPUT_DIR%\backend"
mkdir "%BUILD_OUTPUT_DIR%\frontend"

REM 编译后端
echo.
echo [2/5] 编译后端 (Go)...
cd /d "%BACKEND_DIR%"

REM 检查 Go 是否安装
where go >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误: 未找到 Go 编译器，请先安装 Go
    pause
    exit /b 1
)

echo Go 版本:
go version
echo 正在下载依赖...
go mod download

echo 正在编译后端...
set CGO_ENABLED=1
go build -ldflags="-s -w" -o "%BUILD_OUTPUT_DIR%\backend\netmaker.exe" .

if not exist "%BUILD_OUTPUT_DIR%\backend\netmaker.exe" (
    echo 错误: 后端编译失败
    pause
    exit /b 1
)
echo 后端编译成功

REM 复制后端配置文件
if exist "%BACKEND_DIR%\config" (
    xcopy /e /i /y "%BACKEND_DIR%\config" "%BUILD_OUTPUT_DIR%\backend\config" >nul
    echo 已复制配置文件
)

REM 编译前端
echo.
echo [3/5] 编译前端 (React)...
cd /d "%FRONTEND_DIR%"

REM 检查 Node.js 是否安装
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误: 未找到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)

echo Node 版本:
node --version
echo npm 版本:
npm --version

REM 安装依赖
if not exist "node_modules" (
    echo 正在安装前端依赖...
    call npm install
) else (
    echo 依赖已存在，跳过安装
)

REM 构建前端
echo 正在编译前端...
set NODE_OPTIONS=--openssl-legacy-provider
call npm run build

if not exist "%FRONTEND_DIR%\build" (
    echo 错误: 前端编译失败
    pause
    exit /b 1
)

xcopy /e /i /y "%FRONTEND_DIR%\build\*" "%BUILD_OUTPUT_DIR%\frontend\" >nul
echo 前端编译成功

REM 生成配置文件
echo.
echo [4/5] 生成配置文件...

REM 生成后端配置
(
echo # Netmaker 后端配置
echo SERVER_HOST=0.0.0.0
echo API_PORT=8081
echo MASTER_KEY=your-secret-key-here
echo DATABASE=sqlite
echo SQL_CONN=netmaker.db
echo CORS_ALLOWED_ORIGIN=http://localhost:3000
echo SERVER_HTTP_HOST=http://localhost:8081
) > "%BUILD_OUTPUT_DIR%\backend\server.env"

REM 生成前端配置
(
echo window.REACT_APP_BACKEND = "http://localhost:8081";
) > "%BUILD_OUTPUT_DIR%\frontend\config.js"

REM 生成启动脚本
echo.
echo [5/5] 生成启动脚本...

REM 后端启动脚本
(
echo @echo off
echo cd /d "%%~dp0backend"
echo echo 正在启动 Netmaker 后端服务...
echo echo API 地址: http://localhost:8081
echo echo.
echo echo 按 Ctrl+C 停止服务
echo echo.
echo REM 加载环境变量
echo for /f "tokens=1,2 delims==" %%%%a in ^(server.env^) do ^(
echo     if not "%%%%a"=="" if not "%%%%a:~0,1%%"=="#" set "%%%%a=%%%%b"
echo ^)
echo netmaker.exe
echo pause
) > "%BUILD_OUTPUT_DIR%\start-backend.bat"

REM 前端启动脚本
(
echo @echo off
echo cd /d "%%~dp0frontend"
echo set PORT=3000
echo echo 正在启动 Netmaker 前端服务...
echo echo 访问地址: http://localhost:%%PORT%%
echo echo.
echo echo 按 Ctrl+C 停止服务
echo echo.
echo REM 尝试使用不同的 HTTP 服务器
echo where python >nul 2^>nul
echo if %%errorlevel%% equ 0 ^(
echo     python -m http.server %%PORT%%
echo     goto :end
echo ^)
echo where python3 >nul 2^>nul
echo if %%errorlevel%% equ 0 ^(
echo     python3 -m http.server %%PORT%%
echo     goto :end
echo ^)
echo where php >nul 2^>nul
echo if %%errorlevel%% equ 0 ^(
echo     php -S localhost:%%PORT%%
echo     goto :end
echo ^)
echo echo 错误: 未找到 Python 或 PHP，无法启动 HTTP 服务器
echo echo 请安装 Python 或使用其他 Web 服务器
echo pause
echo :end
) > "%BUILD_OUTPUT_DIR%\start-frontend.bat"

REM 一键启动脚本
(
echo @echo off
echo cd /d "%%~dp0"
echo echo =========================================
echo echo 启动 Netmaker 前后端服务
echo echo =========================================
echo echo.
echo echo 后端 API: http://localhost:8081
echo echo 前端界面: http://localhost:3000
echo echo.
echo echo 提示: 后端将在新窗口启动
echo echo       关闭前端窗口时，请手动关闭后端窗口
echo echo.
echo pause
echo REM 在新窗口启动后端
echo start "Netmaker Backend" cmd /k "%%~dp0start-backend.bat"
echo REM 等待后端启动
echo timeout /t 3 /nobreak ^>nul
echo REM 启动前端
echo call "%%~dp0start-frontend.bat"
) > "%BUILD_OUTPUT_DIR%\start-all.bat"

REM 完成
echo.
echo ========================================
echo 编译完成！
echo ========================================
echo.
echo 构建输出目录: %BUILD_OUTPUT_DIR%
echo.
echo 目录结构:
echo   build\
echo   ├── backend\          # 后端可执行文件
echo   │   ├── netmaker.exe  # 后端程序
echo   │   └── server.env    # 后端配置
echo   ├── frontend\         # 前端静态文件
echo   │   └── config.js     # 前端配置
echo   ├── start-backend.bat # 启动后端
echo   ├── start-frontend.bat# 启动前端
echo   └── start-all.bat     # 一键启动前后端
echo.
echo 使用方法:
echo   1. 启动所有服务:
echo      cd build
echo      start-all.bat
echo.
echo   2. 分别启动:
echo      cd build
echo      start-backend.bat   # 启动后端
echo      start-frontend.bat  # 启动前端
echo.
echo 访问地址:
echo   前端: http://localhost:3000
echo   后端: http://localhost:8081
echo.
echo 注意事项:
echo   - 首次运行需要配置 MASTER_KEY 和数据库
echo   - 修改配置请编辑 build\backend\server.env
echo   - 如需修改前端 API 地址，编辑 build\frontend\config.js
echo.
pause
