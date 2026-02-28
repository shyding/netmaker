#!/bin/bash

# Netmaker 手动部署脚本
# 用于在 VPS 上手动部署 Netmaker（不使用 GitHub Actions）

set -e

# 配置变量（请根据实际情况修改）
BACKEND_URL="http://localhost:8081"
CORS_ORIGIN="http://localhost:3000"
MASTER_KEY="your-secret-key-here"
DOMAIN_NAME="localhost"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Netmaker 手动部署脚本${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""

# 检查是否为 root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}请使用 root 权限运行此脚本${NC}"
    exit 1
fi

# 检查必要文件
if [ ! -f "netmaker/netmaker" ] && [ ! -f "netmaker/netmaker-linux" ]; then
    echo -e "${RED}错误: 未找到后端可执行文件${NC}"
    echo "请先编译后端: cd netmaker && go build"
    exit 1
fi

if [ ! -d "netmaker-ui/build" ]; then
    echo -e "${RED}错误: 未找到前端构建文件${NC}"
    echo "请先编译前端: cd netmaker-ui && npm run build"
    exit 1
fi

# 定义目录
INSTALL_DIR="/opt/netmaker"
FRONTEND_DIR="/var/www/netmaker"

echo -e "${YELLOW}[1/7] 停止现有服务...${NC}"
systemctl stop netmaker 2>/dev/null || true

echo -e "${YELLOW}[2/7] 创建目录...${NC}"
mkdir -p $INSTALL_DIR
mkdir -p $FRONTEND_DIR
mkdir -p $INSTALL_DIR/config
mkdir -p /var/log/netmaker

echo -e "${YELLOW}[3/7] 部署后端...${NC}"
if [ -f "netmaker/netmaker-linux" ]; then
    cp netmaker/netmaker-linux $INSTALL_DIR/netmaker
else
    cp netmaker/netmaker $INSTALL_DIR/netmaker
fi
chmod +x $INSTALL_DIR/netmaker

# 复制配置文件
if [ -d "netmaker/config" ]; then
    cp -r netmaker/config/* $INSTALL_DIR/config/
fi

echo -e "${YELLOW}[4/7] 部署前端...${NC}"
cp -r netmaker-ui/build/* $FRONTEND_DIR/

# 生成前端配置
cat > $FRONTEND_DIR/config.js << EOF
window.REACT_APP_BACKEND = "$BACKEND_URL";
EOF

echo -e "${YELLOW}[5/7] 创建后端配置...${NC}"
cat > $INSTALL_DIR/server.env << EOF
SERVER_HOST=0.0.0.0
API_PORT=8081
MASTER_KEY=$MASTER_KEY
DATABASE=sqlite
SQL_CONN=$INSTALL_DIR/netmaker.db
CORS_ALLOWED_ORIGIN=$CORS_ORIGIN
SERVER_HTTP_HOST=$BACKEND_URL
EOF

echo -e "${YELLOW}[6/7] 创建 systemd 服务...${NC}"
cat > /etc/systemd/system/netmaker.service << 'EOF'
[Unit]
Description=Netmaker Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/netmaker
EnvironmentFile=/opt/netmaker/server.env
ExecStart=/opt/netmaker/netmaker
Restart=always
RestartSec=10
StandardOutput=append:/var/log/netmaker/netmaker.log
StandardError=append:/var/log/netmaker/netmaker-error.log

# 安全设置
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

# 配置 Nginx
cat > /etc/nginx/sites-available/netmaker << EOF
server {
    listen 8888;
    server_name $DOMAIN_NAME;

    # 前端
    location / {
        root /var/www/netmaker;
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "no-cache";
    }

    # 后端 API
    location /api {
        proxy_pass http://localhost:8081;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# 启用 Nginx 站点
ln -sf /etc/nginx/sites-available/netmaker /etc/nginx/sites-enabled/netmaker
nginx -t && systemctl reload nginx

echo -e "${YELLOW}[7/7] 启动服务...${NC}"
systemctl daemon-reload
systemctl enable netmaker
systemctl start netmaker

# 等待服务启动
sleep 3

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}部署完成！${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "服务状态:"
systemctl status netmaker --no-pager || true
echo ""
echo "访问地址:"
echo "  前端: http://$DOMAIN_NAME:8888"
echo "  后端: $BACKEND_URL"
echo ""
echo "管理命令:"
echo "  查看日志: sudo journalctl -u netmaker -f"
echo "  重启服务: sudo systemctl restart netmaker"
echo "  停止服务: sudo systemctl stop netmaker"
echo ""
echo "配置文件:"
echo "  后端配置: $INSTALL_DIR/server.env"
echo "  前端配置: $FRONTEND_DIR/config.js"
echo "  服务配置: /etc/systemd/system/netmaker.service"
echo ""
