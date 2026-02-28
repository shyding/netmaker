#!/bin/bash

# Netmaker VPS 初始化脚本
# 用于准备 VPS 环境以部署 Netmaker

set -e

echo "========================================="
echo "Netmaker VPS 环境初始化"
echo "========================================="
echo ""

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then
    echo "请使用 root 权限运行此脚本"
    echo "使用: sudo $0"
    exit 1
fi

# 检测操作系统
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    VERSION=$VERSION_ID
else
    echo "无法检测操作系统"
    exit 1
fi

echo "检测到操作系统: $OS $VERSION"
echo ""

# 更新系统
echo "[1/6] 更新系统包..."
apt update && apt upgrade -y

# 安装必要软件
echo ""
echo "[2/6] 安装必要软件..."
apt install -y \
    nginx \
    sqlite3 \
    curl \
    wget \
    ufw \
    net-tools \
    htop

# 创建目录
echo ""
echo "[3/6] 创建应用目录..."
mkdir -p /opt/netmaker
mkdir -p /var/www/netmaker
mkdir -p /var/log/netmaker

echo "✓ 创建目录:"
echo "  - /opt/netmaker (后端)"
echo "  - /var/www/netmaker (前端)"
echo "  - /var/log/netmaker (日志)"

# 配置防火墙
echo ""
echo "[4/6] 配置防火墙..."

# 检查 UFW 是否已启用
if ufw status | grep -q "Status: active"; then
    echo "UFW 已启用"
else
    echo "启用 UFW..."
fi

# 允许必要端口
ufw allow 22/tcp comment 'SSH'
ufw allow 8888/tcp comment 'Netmaker Frontend'
ufw allow 8081/tcp comment 'Netmaker API'

# 如果 UFW 未启用，询问是否启用
if ! ufw status | grep -q "Status: active"; then
    echo ""
    read -p "是否启用防火墙? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ufw --force enable
        echo "✓ 防火墙已启用"
    else
        echo "⚠ 防火墙未启用，请手动配置"
    fi
fi

# 配置 Nginx
echo ""
echo "[5/6] 配置 Nginx..."

# 删除默认站点
rm -f /etc/nginx/sites-enabled/default

# 测试 Nginx 配置
nginx -t

# 重启 Nginx
systemctl restart nginx
systemctl enable nginx

echo "✓ Nginx 已配置并启动"

# 创建 systemd 服务模板
echo ""
echo "[6/6] 创建 systemd 服务模板..."

cat > /etc/systemd/system/netmaker.service.template << 'EOF'
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

echo "✓ 服务模板已创建: /etc/systemd/system/netmaker.service.template"

# 显示系统信息
echo ""
echo "========================================="
echo "初始化完成！"
echo "========================================="
echo ""
echo "系统信息:"
echo "  操作系统: $OS $VERSION"
echo "  内存: $(free -h | awk '/^Mem:/ {print $2}')"
echo "  磁盘: $(df -h / | awk 'NR==2 {print $4}') 可用"
echo ""
echo "已安装服务:"
echo "  ✓ Nginx $(nginx -v 2>&1 | cut -d'/' -f2)"
echo "  ✓ SQLite $(sqlite3 --version | cut -d' ' -f1)"
echo ""
echo "防火墙规则:"
ufw status numbered | grep -E "22|8888|8081" || echo "  未配置"
echo ""
echo "下一步:"
echo "  1. 在 GitHub 中配置 Secrets (参考 DEPLOY_GUIDE.md)"
echo "  2. 推送代码到 GitHub 触发自动部署"
echo "  3. 或使用手动部署脚本"
echo ""
echo "查看部署指南:"
echo "  cat DEPLOY_GUIDE.md"
echo ""
