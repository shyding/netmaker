@echo off
REM Netclient 多平台编译脚本 (Windows 版本)
REM 用于构建 Windows, Linux, macOS 版本的 netclient

setlocal enabledelayedexpansion

set VERSION=v1.5.0
set BUILD_DIR=build\netclient
set NETCLIENT_DIR=netclient

echo ==========================================
echo Building Netclient %VERSION%
echo ==========================================

REM 创建构建目录
if not exist %BUILD_DIR% mkdir %BUILD_DIR%

REM 进入 netclient 目录
cd %NETCLIENT_DIR%

echo.
echo Building for Linux AMD64...
set GOOS=linux
set GOARCH=amd64
go build -ldflags="-s -w -X main.version=%VERSION%" -o ..\%BUILD_DIR%\netclient-linux-amd64 .
echo [OK] Linux AMD64 build complete

echo.
echo Building for Linux ARM64...
set GOOS=linux
set GOARCH=arm64
go build -ldflags="-s -w -X main.version=%VERSION%" -o ..\%BUILD_DIR%\netclient-linux-arm64 .
echo [OK] Linux ARM64 build complete

echo.
echo Building for Windows AMD64...
set GOOS=windows
set GOARCH=amd64
go build -ldflags="-s -w -X main.version=%VERSION%" -o ..\%BUILD_DIR%\netclient-windows-amd64.exe .
echo [OK] Windows AMD64 build complete

echo.
echo Building for macOS AMD64...
set GOOS=darwin
set GOARCH=amd64
go build -ldflags="-s -w -X main.version=%VERSION%" -o ..\%BUILD_DIR%\netclient-darwin-amd64 .
echo [OK] macOS AMD64 build complete

echo.
echo Building for macOS ARM64 (Apple Silicon)...
set GOOS=darwin
set GOARCH=arm64
go build -ldflags="-s -w -X main.version=%VERSION%" -o ..\%BUILD_DIR%\netclient-darwin-arm64 .
echo [OK] macOS ARM64 build complete

cd ..

echo.
echo ==========================================
echo Build complete!
echo ==========================================
echo Binaries location: %BUILD_DIR%\
echo.
dir %BUILD_DIR%
echo.
echo To deploy, copy these files to your web server

endlocal
