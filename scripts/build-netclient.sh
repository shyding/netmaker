#!/bin/bash

# Netclient 多平台编译脚本
# 用于构建 Windows, Linux, macOS 版本的 netclient

set -e

VERSION="v1.5.0"
BUILD_DIR="build/netclient"
NETCLIENT_DIR="netclient"

echo "=========================================="
echo "Building Netclient ${VERSION}"
echo "=========================================="

# 创建构建目录
mkdir -p ${BUILD_DIR}

# 进入 netclient 目录
cd ${NETCLIENT_DIR}

echo ""
echo "Building for Linux AMD64..."
GOOS=linux GOARCH=amd64 go build -ldflags="-s -w -X main.version=${VERSION}" -o ../${BUILD_DIR}/netclient-linux-amd64 .
echo "✓ Linux AMD64 build complete"

echo ""
echo "Building for Linux ARM64..."
GOOS=linux GOARCH=arm64 go build -ldflags="-s -w -X main.version=${VERSION}" -o ../${BUILD_DIR}/netclient-linux-arm64 .
echo "✓ Linux ARM64 build complete"

echo ""
echo "Building for Linux ARM..."
GOOS=linux GOARCH=arm go build -ldflags="-s -w -X main.version=${VERSION}" -o ../${BUILD_DIR}/netclient-linux-arm .
echo "✓ Linux ARM build complete"

echo ""
echo "Building for Windows AMD64..."
GOOS=windows GOARCH=amd64 go build -ldflags="-s -w -X main.version=${VERSION}" -o ../${BUILD_DIR}/netclient-windows-amd64.exe .
echo "✓ Windows AMD64 build complete"

echo ""
echo "Building for macOS AMD64..."
GOOS=darwin GOARCH=amd64 go build -ldflags="-s -w -X main.version=${VERSION}" -o ../${BUILD_DIR}/netclient-darwin-amd64 .
echo "✓ macOS AMD64 build complete"

echo ""
echo "Building for macOS ARM64 (Apple Silicon)..."
GOOS=darwin GOARCH=arm64 go build -ldflags="-s -w -X main.version=${VERSION}" -o ../${BUILD_DIR}/netclient-darwin-arm64 .
echo "✓ macOS ARM64 build complete"

echo ""
echo "Building for FreeBSD AMD64..."
GOOS=freebsd GOARCH=amd64 go build -ldflags="-s -w -X main.version=${VERSION}" -o ../${BUILD_DIR}/netclient-freebsd-amd64 .
echo "✓ FreeBSD AMD64 build complete"

cd ..

# 生成校验和
echo ""
echo "Generating checksums..."
cd ${BUILD_DIR}
sha256sum * > checksums.txt
echo "✓ Checksums generated"

cd ../..

echo ""
echo "=========================================="
echo "Build complete!"
echo "=========================================="
echo "Binaries location: ${BUILD_DIR}/"
echo ""
echo "Files:"
ls -lh ${BUILD_DIR}/
echo ""
echo "To deploy, copy these files to your web server:"
echo "  cp ${BUILD_DIR}/* /var/www/netmaker/downloads/"
