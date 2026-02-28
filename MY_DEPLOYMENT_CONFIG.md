# Netmaker 部署配置 - nm.icta.top

## 你的服务器信息

- **VPS IP**: `124.156.207.253`
- **域名**: `nm.icta.top`
- **前端访问地址**: `http://nm.icta.top:8888`
- **后端 API 地址**: `http://api.nm.icta.top:8081`

---

## 第一步：配置 DNS

在你的域名管理面板（如阿里云、腾讯云、Cloudflare 等）添加以下 DNS 记录：

### A 记录配置

| 主机记录 | 记录类型 | 记录值 | TTL |
|---------|---------|--------|-----|
| `@` | A | `124.156.207.253` | 600 |
| `api` | A | `124.156.207.253` | 600 |

**说明**:
- `@` 记录指向主域名 `nm.icta.top`
- `api` 记录指向 API 子域名 `api.nm.icta.top`

### 验证 DNS 配置

等待 DNS 生效（通常 5-10 分钟），然后测试：

```bash
# 测试主域名
ping nm.icta.top

# 测试 API 子域名
ping api.nm.icta.top

# 或使用 nslookup
nslookup nm.icta.top
nslookup api.nm.icta.top
```

---

## 第二步：准备 VPS

### 1. 生成 SSH 密钥

在你的本地电脑（Windows）上运行：

```bash
# 在 Git Bash 或 PowerShell 中运行
ssh-keygen -t ed25519 -C "github-actions-netmaker" -f ~/.ssh/netmaker_deploy_key

# 查看公钥
cat ~/.ssh/netmaker_deploy_key.pub
```

### 2. 将公钥添加到 VPS

```bash
# 方法 1: 使用 ssh-copy-id
ssh-copy-id -i ~/.ssh/netmaker_deploy_key.pub root@124.156.207.253

# 方法 2: 手动添加
ssh root@124.156.207.253
mkdir -p ~/.ssh
echo "你的公钥内容" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
exit
```

### 3. 测试 SSH 连接

```bash
ssh -i ~/.ssh/netmaker_deploy_key root@124.156.207.253
```

如果能成功登录，说明配置正确。

### 4. 初始化 VPS 环境

在 VPS 上运行：

```bash
# 下载初始化脚本
curl -o setup-vps.sh https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/netmaker/main/scripts/setup-vps.sh

# 添加执行权限
chmod +x setup-vps.sh

# 运行初始化
sudo ./setup-vps.sh
```

---

## 第三步：配置 GitHub Secrets

在 GitHub 仓库中配置以下 Secrets：

**路径**: 仓库 → Settings → Secrets and variables → Actions → New repository secret

### 配置清单

#### 1. VPS_HOST
```
124.156.207.253
```

#### 2. VPS_USERNAME
```
root
```
（如果你使用的是其他用户，如 `ubuntu`，请相应修改）

#### 3. VPS_SSH_KEY

运行以下命令获取私钥内容：
```bash
cat ~/.ssh/netmaker_deploy_key
```

复制**完整输出**，包括：
```
-----BEGIN OPENSSH PRIVATE KEY-----
... (所有内容) ...
-----END OPENSSH PRIVATE KEY-----
```

#### 4. VPS_PORT
```
22
```

#### 5. NETMAKER_MASTER_KEY

生成强密码：
```bash
# 在本地运行生成随机密码
openssl rand -base64 32
```

或者使用你自己的强密码，例如：
```
NmIcta2024!SecureKey@Top
```

#### 6. BACKEND_URL
```
http://api.nm.icta.top:8081
```

#### 7. CORS_ORIGIN
```
http://nm.icta.top:8888
```

#### 8. DOMAIN_NAME
```
nm.icta.top
```

---

## 配置总结表

| Secret 名称 | 值 | 说明 |
|------------|---|------|
| `VPS_HOST` | `124.156.207.253` | VPS IP 地址 |
| `VPS_USERNAME` | `root` | SSH 用户名 |
| `VPS_SSH_KEY` | `-----BEGIN OPENSSH...` | SSH 私钥完整内容 |
| `VPS_PORT` | `22` | SSH 端口 |
| `NETMAKER_MASTER_KEY` | `你的强密码` | 主密钥 |
| `BACKEND_URL` | `http://api.nm.icta.top:8081` | 后端 API 地址 |
| `CORS_ORIGIN` | `http://nm.icta.top:8888` | 前端地址 |
| `DOMAIN_NAME` | `nm.icta.top` | 域名 |

---

## 第四步：部署

### 1. 推送代码

```bash
git add .
git commit -m "Deploy Netmaker to nm.icta.top"
git push origin main
```

### 2. 查看部署进度

1. 访问 GitHub 仓库
2. 点击 **Actions** 标签
3. 查看 "Deploy to VPS" workflow 运行状态

### 3. 部署完成后访问

- **前端界面**: http://nm.icta.top:8888
- **后端 API**: http://api.nm.icta.top:8081
- **健康检查**: http://api.nm.icta.top:8081/api/server/health

---

## 第五步：验证部署

### 在 VPS 上检查服务

```bash
# SSH 登录 VPS
ssh root@124.156.207.253

# 查看服务状态
sudo systemctl status netmaker

# 查看日志
sudo journalctl -u netmaker -f

# 检查端口监听
sudo netstat -tlnp | grep 8888
sudo netstat -tlnp | grep 8081

# 测试 API
curl http://localhost:8081/api/server/health
```

### 在本地测试访问

```bash
# 测试后端 API
curl http://api.nm.icta.top:8081/api/server/health

# 在浏览器中访问前端
# http://nm.icta.top:8888
```

---

## 防火墙配置

确保 VPS 防火墙允许以下端口：

```bash
# 在 VPS 上运行
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 8888/tcp  # 前端
sudo ufw allow 8081/tcp  # 后端 API
sudo ufw status
```

如果使用云服务商（阿里云、腾讯云等），还需要在**安全组**中开放这些端口。

---

## 常见问题

### Q1: DNS 未生效

**症状**: 无法通过域名访问

**解决**:
```bash
# 检查 DNS 解析
nslookup nm.icta.top
nslookup api.nm.icta.top

# 如果解析不正确，等待 DNS 传播（最多 24 小时）
# 临时可以先使用 IP 访问
```

### Q2: 端口无法访问

**症状**: 浏览器显示 "无法访问此网站"

**解决**:
1. 检查 VPS 防火墙: `sudo ufw status`
2. 检查云服务商安全组规则
3. 检查服务是否运行: `sudo systemctl status netmaker`

### Q3: CORS 错误

**症状**: 前端可以打开，但 API 请求失败

**解决**:
```bash
# 在 VPS 上检查配置
cat /opt/netmaker/server.env

# 确保 CORS_ALLOWED_ORIGIN 正确
# 应该是: http://nm.icta.top:8888
```

---

## 后续优化（可选）

### 1. 配置 HTTPS

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取 SSL 证书
sudo certbot --nginx -d nm.icta.top -d api.nm.icta.top
```

### 2. 配置自动备份

```bash
# 创建备份脚本
sudo crontab -e

# 添加每天凌晨 2 点备份
0 2 * * * cp /opt/netmaker/netmaker.db /opt/netmaker/backup-$(date +\%Y\%m\%d).db
```

### 3. 监控服务

```bash
# 安装监控工具
sudo apt install htop

# 查看资源使用
htop
```

---

## 访问地址汇总

部署完成后，你可以通过以下地址访问：

- **前端**: http://nm.icta.top:8888
- **后端**: http://api.nm.icta.top:8081
- **健康检查**: http://api.nm.icta.top:8081/api/server/health

---

## 需要帮助？

如果遇到问题：
1. 查看 GitHub Actions 日志
2. 查看 VPS 日志: `sudo journalctl -u netmaker -f`
3. 参考 [GITHUB_SECRETS_GUIDE.md](./GITHUB_SECRETS_GUIDE.md)
4. 参考 [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md)
