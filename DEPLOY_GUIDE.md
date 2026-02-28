# GitHub Actions 自动部署配置指南

## 概述

这个 CI/CD 流程会在你推送代码到 GitHub 时自动：
1. 编译后端（Go）和前端（React）
2. 将编译好的文件部署到 VPS
3. 创建并启动 systemd 服务
4. 配置 Nginx 反向代理
5. 设置开机自启

## 前置要求

### VPS 要求

- **操作系统**: Ubuntu 20.04+ / Debian 11+
- **内存**: 至少 1GB
- **已安装软件**:
  - Nginx
  - systemd
  - SQLite3

### 本地要求

- GitHub 账号
- SSH 访问 VPS 的权限

## 配置步骤

### 1. 准备 VPS

在 VPS 上运行初始化脚本：

```bash
# 下载并运行初始化脚本
curl -o setup-vps.sh https://raw.githubusercontent.com/YOUR_USERNAME/netmaker/main/scripts/setup-vps.sh
chmod +x setup-vps.sh
sudo ./setup-vps.sh
```

或者手动安装依赖：

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装必要软件
sudo apt install -y nginx sqlite3

# 创建目录
sudo mkdir -p /opt/netmaker
sudo mkdir -p /var/www/netmaker
sudo mkdir -p /var/log/netmaker

# 配置防火墙
sudo ufw allow 22/tcp
sudo ufw allow 8888/tcp
sudo ufw allow 8081/tcp
sudo ufw enable
```

### 2. 生成 SSH 密钥

在本地生成 SSH 密钥对（如果还没有）：

```bash
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions_key
```

将公钥添加到 VPS：

```bash
ssh-copy-id -i ~/.ssh/github_actions_key.pub user@your-vps-ip
```

### 3. 配置 GitHub Secrets

在 GitHub 仓库中设置以下 Secrets：

**Settings → Secrets and variables → Actions → New repository secret**

| Secret 名称 | 说明 | 示例值 |
|------------|------|--------|
| `VPS_HOST` | VPS 的 IP 地址或域名 | `192.168.1.100` |
| `VPS_USERNAME` | SSH 登录用户名 | `root` 或 `ubuntu` |
| `VPS_SSH_KEY` | SSH 私钥内容 | 复制 `~/.ssh/github_actions_key` 的全部内容 |
| `VPS_PORT` | SSH 端口 | `22` |
| `NETMAKER_MASTER_KEY` | Netmaker 主密钥（强密码） | `your-super-secret-key-123` |
| `BACKEND_URL` | 后端 API 地址 | `http://api.yourdomain.com:8081` 或 `http://your-vps-ip:8081` |
| `CORS_ORIGIN` | 允许的前端域名 | `http://yourdomain.com:8888` |
| `DOMAIN_NAME` | 前端域名 | `yourdomain.com` |

#### 如何获取 SSH 私钥内容

```bash
# 显示私钥内容
cat ~/.ssh/github_actions_key

# 复制全部内容，包括：
# -----BEGIN OPENSSH PRIVATE KEY-----
# ... (密钥内容) ...
# -----END OPENSSH PRIVATE KEY-----
```

### 4. 配置域名（可选）

如果使用域名，需要配置 DNS：

```
A 记录:
  yourdomain.com → VPS_IP
  api.yourdomain.com → VPS_IP
```

### 5. 触发部署

#### 自动触发

推送代码到 `main` 或 `master` 分支：

```bash
git add .
git commit -m "Deploy to VPS"
git push origin main
```

#### 手动触发

在 GitHub 仓库页面：
1. 点击 **Actions** 标签
2. 选择 **Deploy to VPS** workflow
3. 点击 **Run workflow**
4. 选择分支并点击 **Run workflow**

### 6. 监控部署

在 GitHub Actions 页面查看部署进度：
- 绿色 ✅ = 部署成功
- 红色 ❌ = 部署失败（点击查看日志）

## 服务管理

### 在 VPS 上管理服务

```bash
# 查看服务状态
sudo systemctl status netmaker

# 启动服务
sudo systemctl start netmaker

# 停止服务
sudo systemctl stop netmaker

# 重启服务
sudo systemctl restart netmaker

# 查看日志
sudo journalctl -u netmaker -f
sudo tail -f /var/log/netmaker/netmaker.log

# 禁用开机自启
sudo systemctl disable netmaker

# 启用开机自启
sudo systemctl enable netmaker
```

### 查看 Nginx 状态

```bash
# 检查配置
sudo nginx -t

# 重新加载配置
sudo systemctl reload nginx

# 查看日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 目录结构

部署后的 VPS 目录结构：

```
/opt/netmaker/              # 后端安装目录
├── netmaker                # 后端可执行文件
├── server.env              # 后端配置
├── netmaker.db             # SQLite 数据库
└── config/                 # 配置文件

/var/www/netmaker/          # 前端静态文件
├── index.html
├── config.js               # 前端配置
└── static/

/var/log/netmaker/          # 日志目录
├── netmaker.log            # 标准输出
└── netmaker-error.log      # 错误日志

/etc/systemd/system/        # 系统服务
└── netmaker.service        # Netmaker 服务配置

/etc/nginx/sites-available/ # Nginx 配置
└── netmaker                # Netmaker 站点配置
```

## 访问应用

部署成功后：

- **前端界面**: `http://yourdomain.com:8888` 或 `http://VPS_IP:8888`
- **后端 API**: `http://api.yourdomain.com:8081` 或 `http://VPS_IP:8081`
- **健康检查**: `http://VPS_IP:8081/api/server/health`

## 故障排查

### 部署失败

1. **检查 GitHub Actions 日志**
   - 在 GitHub 仓库的 Actions 标签查看详细错误

2. **SSH 连接失败**
   ```bash
   # 测试 SSH 连接
   ssh -i ~/.ssh/github_actions_key user@vps-ip
   ```

3. **编译失败**
   - 检查 Go 和 Node.js 版本
   - 查看编译日志

### 服务无法启动

```bash
# 查看详细错误
sudo journalctl -u netmaker -n 50 --no-pager

# 检查配置文件
cat /opt/netmaker/server.env

# 手动运行测试
cd /opt/netmaker
sudo ./netmaker
```

### 前端无法访问

```bash
# 检查 Nginx 配置
sudo nginx -t

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# 检查文件权限
ls -la /var/www/netmaker/
```

### 后端 API 无法访问

```bash
# 检查端口是否监听
sudo netstat -tlnp | grep 8081

# 检查防火墙
sudo ufw status

# 测试 API
curl http://localhost:8081/api/server/health
```

## 更新配置

### 修改后端配置

1. 在 VPS 上编辑配置：
   ```bash
   sudo nano /opt/netmaker/server.env
   ```

2. 重启服务：
   ```bash
   sudo systemctl restart netmaker
   ```

### 修改前端配置

1. 编辑前端配置：
   ```bash
   sudo nano /var/www/netmaker/config.js
   ```

2. 清除浏览器缓存并刷新

### 更新 GitHub Secrets

在 GitHub 仓库中：
**Settings → Secrets and variables → Actions → 编辑对应的 Secret**

## 安全建议

1. **使用强密码**
   - `NETMAKER_MASTER_KEY` 应该是强随机密码

2. **配置 HTTPS**
   ```bash
   # 安装 Certbot
   sudo apt install certbot python3-certbot-nginx

   # 获取 SSL 证书
   sudo certbot --nginx -d yourdomain.com
   ```

3. **限制 SSH 访问**
   ```bash
   # 禁用密码登录，仅允许密钥
   sudo nano /etc/ssh/sshd_config
   # 设置: PasswordAuthentication no
   sudo systemctl restart sshd
   ```

4. **定期备份数据库**
   ```bash
   # 创建备份脚本
   sudo crontab -e
   # 添加: 0 2 * * * cp /opt/netmaker/netmaker.db /opt/netmaker/backup-$(date +\%Y\%m\%d).db
   ```

## 回滚部署

如果新版本有问题，可以手动回滚：

```bash
# 停止服务
sudo systemctl stop netmaker

# 恢复旧版本（需要提前备份）
sudo cp /opt/netmaker/netmaker.backup /opt/netmaker/netmaker

# 启动服务
sudo systemctl start netmaker
```

## 支持

如有问题：
1. 查看 GitHub Actions 日志
2. 查看 VPS 服务日志
3. 检查本文档的故障排查部分
