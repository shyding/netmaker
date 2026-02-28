#!/bin/bash

# Netmaker 前后端一键编译脚本
# 作者: Claude
# 日期: 2026-02-28

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/netmaker"
FRONTEND_DIR="$PROJECT_ROOT/netmaker-ui"
BUILD_OUTPUT_DIR="$PROJECT_ROOT/build"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Netmaker 前后端一键编译脚本${NC}"
echo -e "${GREEN}========================================${NC}"

# 清理旧的构建输出
echo -e "\n${YELLOW}[1/5] 清理旧的构建文件...${NC}"
rm -rf "$BUILD_OUTPUT_DIR"
mkdir -p "$BUILD_OUTPUT_DIR/backend"
mkdir -p "$BUILD_OUTPUT_DIR/frontend"

# 编译后端
echo -e "\n${YELLOW}[2/5] 编译后端 (Go)...${NC}"
cd "$BACKEND_DIR"

# 检查 Go 是否安装
if ! command -v go &> /dev/null; then
    echo -e "${RED}错误: 未找到 Go 编译器，请先安装 Go${NC}"
    exit 1
fi

echo "Go 版本: $(go version)"
echo "正在下载依赖..."
go mod download

echo "正在编译后端..."
CGO_ENABLED=1 go build -ldflags="-s -w" -o "$BUILD_OUTPUT_DIR/backend/netmaker" .

if [ -f "$BUILD_OUTPUT_DIR/backend/netmaker" ]; then
    echo -e "${GREEN}✓ 后端编译成功${NC}"
else
    echo -e "${RED}✗ 后端编译失败${NC}"
    exit 1
fi

# 复制后端配置文件
if [ -d "$BACKEND_DIR/config" ]; then
    cp -r "$BACKEND_DIR/config" "$BUILD_OUTPUT_DIR/backend/"
    echo "已复制配置文件"
fi

# 编译前端
echo -e "\n${YELLOW}[3/5] 编译前端 (React)...${NC}"
cd "$FRONTEND_DIR"

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo -e "${RED}错误: 未找到 Node.js，请先安装 Node.js${NC}"
    exit 1
fi

echo "Node 版本: $(node --version)"
echo "npm 版本: $(npm --version)"

# 安装依赖
if [ ! -d "node_modules" ]; then
    echo "正在安装前端依赖..."
    npm install
else
    echo "依赖已存在，跳过安装"
fi

# 构建前端
echo "正在编译前端..."
export NODE_OPTIONS="--openssl-legacy-provider"
npm run build

if [ -d "$FRONTEND_DIR/build" ]; then
    cp -r "$FRONTEND_DIR/build"/* "$BUILD_OUTPUT_DIR/frontend/"
    echo -e "${GREEN}✓ 前端编译成功${NC}"
else
    echo -e "${RED}✗ 前端编译失败${NC}"
    exit 1
fi

# 生成配置文件
echo -e "\n${YELLOW}[4/5] 生成配置文件...${NC}"

# 生成后端配置
cat > "$BUILD_OUTPUT_DIR/backend/server.env" << 'EOF'
# Netmaker 后端配置
SERVER_HOST=0.0.0.0
API_PORT=8081
MASTER_KEY=your-secret-key-here
DATABASE=sqlite
SQL_CONN=netmaker.db
CORS_ALLOWED_ORIGIN=http://localhost:3000
SERVER_HTTP_HOST=http://localhost:8081
EOF

# 生成前端配置
cat > "$BUILD_OUTPUT_DIR/frontend/config.js" << 'EOF'
window.REACT_APP_BACKEND = "http://localhost:8081";
EOF

# 生成启动脚本
echo -e "\n${YELLOW}[5/5] 生成启动脚本...${NC}"

# 后端启动脚本
cat > "$BUILD_OUTPUT_DIR/start-backend.sh" << 'EOF'
#!/bin/bash
cd "$(dirname "$0")/backend"
export $(cat server.env | xargs)
echo "正在启动 Netmaker 后端服务..."
echo "API 地址: http://localhost:8081"
./netmaker
EOF
chmod +x "$BUILD_OUTPUT_DIR/start-backend.sh"

# 前端启动脚本（使用 Python 的简单 HTTP 服务器）
cat > "$BUILD_OUTPUT_DIR/start-frontend.sh" << 'EOF'
#!/bin/bash
cd "$(dirname "$0")/frontend"
PORT=3000

echo "正在启动 Netmaker 前端服务..."
echo "访问地址: http://localhost:$PORT"
echo "按 Ctrl+C 停止服务"

# 尝试使用不同的 HTTP 服务器
if command -v python3 &> /dev/null; then
    python3 -m http.server $PORT
elif command -v python &> /dev/null; then
    python -m SimpleHTTPServer $PORT
elif command -v php &> /dev/null; then
    php -S localhost:$PORT
else
    echo "错误: 未找到 Python 或 PHP，无法启动 HTTP 服务器"
    echo "请手动使用 Web 服务器提供 frontend 目录的静态文件"
    exit 1
fi
EOF
chmod +x "$BUILD_OUTPUT_DIR/start-frontend.sh"

# 一键启动脚本
cat > "$BUILD_OUTPUT_DIR/start-all.sh" << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"

echo "========================================="
echo "启动 Netmaker 前后端服务"
echo "========================================="
echo ""
echo "后端 API: http://localhost:8081"
echo "前端界面: http://localhost:3000"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo ""

# 启动后端（后台运行）
./start-backend.sh &
BACKEND_PID=$!
echo "后端进程 PID: $BACKEND_PID"

# 等待后端启动
sleep 3

# 启动前端（前台运行）
./start-frontend.sh

# 清理：当前端停止时，也停止后端
kill $BACKEND_PID 2>/dev/null
EOF
chmod +x "$BUILD_OUTPUT_DIR/start-all.sh"

# 完成
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}编译完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "构建输出目录: ${YELLOW}$BUILD_OUTPUT_DIR${NC}"
echo ""
echo "目录结构:"
echo "  build/"
echo "  ├── backend/          # 后端可执行文件"
echo "  │   ├── netmaker      # 后端程序"
echo "  │   └── server.env    # 后端配置"
echo "  ├── frontend/         # 前端静态文件"
echo "  │   └── config.js     # 前端配置"
echo "  ├── start-backend.sh  # 启动后端"
echo "  ├── start-frontend.sh # 启动前端"
echo "  └── start-all.sh      # 一键启动前后端"
echo ""
echo -e "${YELLOW}使用方法:${NC}"
echo "  1. 启动所有服务:"
echo "     cd build && ./start-all.sh"
echo ""
echo "  2. 分别启动:"
echo "     cd build && ./start-backend.sh   # 启动后端"
echo "     cd build && ./start-frontend.sh  # 启动前端"
echo ""
echo -e "${YELLOW}访问地址:${NC}"
echo "  前端: http://localhost:3000"
echo "  后端: http://localhost:8081"
echo ""
echo -e "${YELLOW}注意事项:${NC}"
echo "  - 首次运行需要配置 MASTER_KEY 和数据库"
echo "  - 修改配置请编辑 build/backend/server.env"
echo "  - 如需修改前端 API 地址，编辑 build/frontend/config.js"
echo ""
