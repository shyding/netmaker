# GitHub Secrets 配置指南

## 第一步：访问 GitHub Secrets 设置

1. 打开你的 GitHub 仓库页面
2. 点击顶部的 **Settings**（设置）标签
3. 在左侧菜单中找到 **Secrets and variables**
4. 点击 **Actions**
5. 点击右上角的 **New repository secret** 按钮

## 第二步：配置所需的 Secrets

你需要配置以下 8 个 Secrets：

### 1. VPS_HOST
**说明**: VPS 的 IP 地址或域名

**示例值**:
```
192.168.1.100
```
或
```
vps.yourdomain.com
```

**如何获取**:
- 从你的 VPS 提供商控制面板查看
- 或在 VPS 上运行: `curl ifconfig.me`

---

### 2. VPS_USERNAME
**说明**: SSH 登录用户名

**示例值**:
```
root
```
或
```
ubuntu
```

**如何获取**:
- 通常是 `root` 或 `ubuntu`（Ubuntu 系统）
- 或你创建的其他用户名

---

### 3. VPS_SSH_KEY
**说明**: SSH 私钥的完整内容

**如何获取**:

#### 方法 1: 使用现有密钥
```bash
# 在本地电脑上查看私钥
cat ~/.ssh/id_rsa
# 或
cat ~/.ssh/id_ed25519
```

#### 方法 2: 生成新密钥（推荐）
```bash
# 生成专用于 GitHub Actions 的密钥
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions_key

# 查看私钥内容
cat ~/.ssh/github_actions_key

# 将公钥添加到 VPS
ssh-copy-id -i ~/.ssh/github_actions_key.pub root@your-vps-ip
```

**示例值**（完整复制，包括开头和结尾）:
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACBK8... (很多行)
...更多内容...
-----END OPENSSH PRIVATE KEY-----
```

**重要提示**:
- 必须包含 `-----BEGIN` 和 `-----END` 行
- 复制完整内容，不要遗漏任何字符
- 这是私钥，不是公钥（.pub 文件）

---

### 4. VPS_PORT
**说明**: SSH 端口号

**示例值**:
```
22
```

**如何获取**:
- 默认是 `22`
- 如果修改过 SSH 端口，使用修改后的端口号

---

### 5. NETMAKER_MASTER_KEY
**说明**: Netmaker 主密钥（强密码）

**示例值**:
```
MySuper$ecretKey123!@#
```

**如何生成**:
```bash
# 生成随机强密码
openssl rand -base64 32
```

**重要提示**:
- 使用强密码，至少 16 位
- 包含大小写字母、数字和特殊字符
- 不要使用简单密码如 "123456"

---

### 6. BACKEND_URL
**说明**: 后端 API 的完整访问地址

**示例值**:

如果使用 IP:
```
http://192.168.1.100:8081
```

如果使用域名:
```
http://api.yourdomain.com:8081
```

**格式**: `http://域名或IP:8081`

---

### 7. CORS_ORIGIN
**说明**: 允许访问后端的前端地址

**示例值**:

如果使用 IP:
```
http://192.168.1.100:8888
```

如果使用域名:
```
http://yourdomain.com:8888
```

**格式**: `http://域名或IP:8888`

**注意**: 必须与前端实际访问地址一致

---

### 8. DOMAIN_NAME
**说明**: 前端域名（不含 http:// 和端口）

**示例值**:

如果使用 IP:
```
192.168.1.100
```

如果使用域名:
```
yourdomain.com
```

**注意**: 只填写域名或 IP，不要加 `http://` 或端口号

---

## 第三步：配置示例

### 场景 1: 使用 IP 地址（最简单）

假设你的 VPS IP 是 `123.45.67.89`

| Secret 名称 | 值 |
|------------|---|
| VPS_HOST | `123.45.67.89` |
| VPS_USERNAME | `root` |
| VPS_SSH_KEY | `-----BEGIN OPENSSH PRIVATE KEY-----\n...` |
| VPS_PORT | `22` |
| NETMAKER_MASTER_KEY | `MyStrongPassword123!@#` |
| BACKEND_URL | `http://123.45.67.89:8081` |
| CORS_ORIGIN | `http://123.45.67.89:8888` |
| DOMAIN_NAME | `123.45.67.89` |

### 场景 2: 使用域名（推荐）

假设你的域名是 `example.com`

| Secret 名称 | 值 |
|------------|---|
| VPS_HOST | `123.45.67.89` |
| VPS_USERNAME | `root` |
| VPS_SSH_KEY | `-----BEGIN OPENSSH PRIVATE KEY-----\n...` |
| VPS_PORT | `22` |
| NETMAKER_MASTER_KEY | `MyStrongPassword123!@#` |
| BACKEND_URL | `http://api.example.com:8081` |
| CORS_ORIGIN | `http://example.com:8888` |
| DOMAIN_NAME | `example.com` |

**DNS 配置**（如果使用域名）:
```
A 记录:
  example.com     → 123.45.67.89
  api.example.com → 123.45.67.89
```

---

## 第四步：验证配置

### 1. 检查 SSH 连接

在本地测试 SSH 连接：
```bash
ssh -i ~/.ssh/github_actions_key root@your-vps-ip
```

如果能成功登录，说明 SSH 配置正确。

### 2. 检查所有 Secrets

在 GitHub 仓库的 Settings → Secrets and variables → Actions 页面，确认所有 8 个 Secrets 都已添加：

- ✅ VPS_HOST
- ✅ VPS_USERNAME
- ✅ VPS_SSH_KEY
- ✅ VPS_PORT
- ✅ NETMAKER_MASTER_KEY
- ✅ BACKEND_URL
- ✅ CORS_ORIGIN
- ✅ DOMAIN_NAME

### 3. 触发部署

推送代码到 GitHub：
```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

### 4. 查看部署进度

1. 在 GitHub 仓库页面点击 **Actions** 标签
2. 查看最新的 workflow 运行
3. 点击进入查看详细日志

---

## 常见问题

### Q1: SSH 私钥格式错误

**问题**: Actions 日志显示 "invalid format" 或 "permission denied"

**解决**:
- 确保复制了完整的私钥内容
- 包含 `-----BEGIN` 和 `-----END` 行
- 没有多余的空格或换行

### Q2: 无法连接到 VPS

**问题**: Actions 日志显示 "connection refused" 或 "timeout"

**解决**:
```bash
# 检查 VPS 防火墙
sudo ufw status

# 确保允许 SSH
sudo ufw allow 22/tcp
```

### Q3: 部署成功但无法访问

**问题**: 部署完成但浏览器无法打开页面

**解决**:
```bash
# 在 VPS 上检查服务状态
sudo systemctl status netmaker

# 检查端口监听
sudo netstat -tlnp | grep 8888
sudo netstat -tlnp | grep 8081

# 检查防火墙
sudo ufw allow 8888/tcp
sudo ufw allow 8081/tcp
```

### Q4: CORS 错误

**问题**: 前端可以访问，但 API 请求失败

**解决**:
- 确保 `CORS_ORIGIN` 与前端访问地址完全一致
- 包括协议（http://）和端口（:8888）

---

## 安全建议

1. **不要在代码中硬编码密钥** - 所有敏感信息都应该使用 Secrets
2. **定期更换密码** - 定期更新 `NETMAKER_MASTER_KEY`
3. **使用专用 SSH 密钥** - 为 GitHub Actions 创建专用密钥
4. **限制 SSH 访问** - 考虑使用 IP 白名单
5. **启用 2FA** - 在 GitHub 账号上启用两步验证

---

## 下一步

配置完成后：

1. **推送代码触发部署**
   ```bash
   git push origin main
   ```

2. **查看部署日志**
   - GitHub → Actions → 查看 workflow 运行

3. **访问应用**
   - 前端: `http://your-domain:8888`
   - 后端: `http://your-domain:8081`

4. **查看 VPS 日志**
   ```bash
   ssh root@your-vps-ip
   sudo journalctl -u netmaker -f
   ```

---

## 需要帮助？

如果遇到问题：
1. 查看 GitHub Actions 日志
2. 查看 VPS 服务日志
3. 参考 [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md)
4. 检查本文档的常见问题部分
