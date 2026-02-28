# Netmaker 部署文件清单

本目录包含 Netmaker 自动部署到 VPS 的所有必要文件。

## 文件结构

```
.
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions 自动部署工作流
├── scripts/
│   ├── setup-vps.sh                # VPS 环境初始化脚本
│   └── deploy-manual.sh            # 手动部署脚本
├── systemd/
│   └── netmaker.service            # systemd 服务配置文件
├── DEPLOY_GUIDE.md                 # 详细部署指南
└── README.md                       # 本文件
```

## 快速开始

### 方式 1: 自动部署（推荐）

1. **准备 VPS**
   ```bash
   # 在 VPS 上运行
   curl -o setup-vps.sh https://raw.githubusercontent.com/YOUR_USERNAME/netmaker/main/scripts/setup-vps.sh
   chmod +x setup-vps.sh
   sudo ./setup-vps.sh
   ```

2. **配置 GitHub Secrets**

   在 GitHub 仓库设置中添加以下 Secrets：
   - `VPS_HOST` - VPS IP 地址
   - `VPS_USERNAME` - SSH 用户名
   - `VPS_SSH_KEY` - SSH 私钥
   - `VPS_PORT` - SSH 端口（默认 22）
   - `NETMAKER_MASTER_KEY` - 主密钥
   - `BACKEND_URL` - 后端 API 地址
   - `CORS_ORIGIN` - 前端域名
   - `DOMAIN_NAME` - 域名

3. **推送代码触发部署**
   ```bash
   git add .
   git commit -m "Deploy to VPS"
   git push origin main
   ```

### 方式 2: 手动部署

1. **在本地编译**
   ```bash
   # 编译后端
   cd netmaker
   GOOS=linux GOARCH=amd64 go build -o netmaker-linux

   # 编译前端
   cd ../netmaker-ui
   npm install
   npm run build
   ```

2. **上传到 VPS**
   ```bash
   scp -r netmaker user@vps-ip:/tmp/
   scp -r netmaker-ui user@vps-ip:/tmp/
   scp scripts/deploy-manual.sh user@vps-ip:/tmp/
   ```

3. **在 VPS 上部署**
   ```bash
   ssh user@vps-ip
   cd /tmp
   sudo ./deploy-manual.sh
   ```

## 文件说明

### .github/workflows/deploy.yml

GitHub Actions 工作流配置文件，定义了自动部署流程：
- 触发条件：推送到 main/master 分支
- 编译前后端
- 部署到 VPS
- 创建系统服务
- 配置 Nginx

### scripts/setup-vps.sh

VPS 环境初始化脚本，执行以下操作：
- 更新系统包
- 安装 Nginx、SQLite 等依赖
- 创建必要目录
- 配置防火墙
- 创建服务模板

### scripts/deploy-manual.sh

手动部署脚本，用于不使用 GitHub Actions 的场景：
- 部署后端和前端文件
- 创建配置文件
- 设置 systemd 服务
- 配置 Nginx

### systemd/netmaker.service

systemd 服务配置文件，定义了：
- 服务启动方式
- 工作目录
- 环境变量文件
- 日志输出
- 自动重启策略
- 安全设置

## 部署后的目录结构

```
VPS 文件系统:
/opt/netmaker/              # 后端安装目录
├── netmaker                # 后端可执行文件
├── server.env              # 环境变量配置
├── netmaker.db             # SQLite 数据库
└── config/                 # 配置文件

/var/www/netmaker/          # 前端静态文件
├── index.html
├── config.js
└── static/

/var/log/netmaker/          # 日志目录
├── netmaker.log
└── netmaker-error.log

/etc/systemd/system/        # 系统服务
└── netmaker.service

/etc/nginx/sites-available/ # Nginx 配置
└── netmaker
```

## 服务管理

```bash
# 查看服务状态
sudo systemctl status netmaker

# 启动/停止/重启
sudo systemctl start netmaker
sudo systemctl stop netmaker
sudo systemctl restart netmaker

# 查看日志
sudo journalctl -u netmaker -f
sudo tail -f /var/log/netmaker/netmaker.log

# 开机自启
sudo systemctl enable netmaker
sudo systemctl disable netmaker
```

## 配置文件

### 后端配置 (/opt/netmaker/server.env)

```bash
SERVER_HOST=0.0.0.0
API_PORT=8081
MASTER_KEY=your-secret-key
DATABASE=sqlite
SQL_CONN=/opt/netmaker/netmaker.db
CORS_ALLOWED_ORIGIN=http://yourdomain.com:8888
SERVER_HTTP_HOST=http://api.yourdomain.com:8081
```

### 前端配置 (/var/www/netmaker/config.js)

```javascript
window.REACT_APP_BACKEND = "http://api.yourdomain.com:8081";
```

## 访问地址

部署完成后，通过以下地址访问：

- **前端界面**: `http://yourdomain.com:8888` 或 `http://VPS_IP:8888`
- **后端 API**: `http://api.yourdomain.com:8081` 或 `http://VPS_IP:8081`
- **健康检查**: `http://VPS_IP:8081/api/server/health`

> 注意：使用的是小众端口 8888（前端）和 8081（后端），避免与常见服务冲突。

```javascript
window.REACT_APP_BACKEND = "http://api.yourdomain.com";
```

## 故障排查

### 查看部署日志

**GitHub Actions:**
- 访问 GitHub 仓库 → Actions 标签
- 查看最新的 workflow 运行记录

**VPS 服务日志:**
```bash
# 实时查看日志
sudo journalctl -u netmaker -f

# 查看最近 50 条日志
sudo journalctl -u netmaker -n 50

# 查看错误日志
sudo tail -f /var/log/netmaker/netmaker-error.log
```

### 常见问题

1. **服务无法启动**
   ```bash
   # 检查配置文件
   cat /opt/netmaker/server.env

   # 手动运行测试
   cd /opt/netmaker
   sudo ./netmaker
   ```

2. **前端无法访问**
   ```bash
   # 检查 Nginx 配置
   sudo nginx -t

   # 查看 Nginx 日志
   sudo tail -f /var/log/nginx/error.log
   ```

3. **API 无法连接**
   ```bash
   # 检查端口监听
   sudo netstat -tlnp | grep 8081

   # 测试 API
   curl http://localhost:8081/api/server/health
   ```

## 安全建议

1. **使用强密码** - `MASTER_KEY` 应该是随机生成的强密码
2. **配置 HTTPS** - 使用 Let's Encrypt 获取免费 SSL 证书
3. **限制 SSH 访问** - 禁用密码登录，仅使用密钥
4. **定期备份** - 备份数据库和配置文件
5. **更新系统** - 定期更新系统和依赖包

## 更多信息

详细的配置和故障排查指南，请参考：
- [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md) - 完整部署指南
- [Netmaker 官方文档](https://docs.netmaker.io)
- [GitHub Actions 文档](https://docs.github.com/en/actions)

## 支持

如有问题，请：
1. 查看 [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md)
2. 检查 GitHub Actions 日志
3. 查看 VPS 服务日志
4. 访问 Netmaker 社区获取帮助
