# 端口配置说明

## 使用的端口

为了避免与常见服务冲突，Netmaker 部署使用以下端口：

- **前端端口**: `8888` - Nginx 提供前端静态文件
- **后端 API 端口**: `8081` - Netmaker 后端服务

## 为什么不使用 80 端口？

1. **避免冲突** - 80 端口通常被其他 Web 服务占用
2. **安全考虑** - 小众端口可以减少自动扫描攻击
3. **灵活性** - 可以与其他服务共存

## 防火墙配置

确保 VPS 防火墙允许这些端口：

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 8888/tcp  # 前端
sudo ufw allow 8081/tcp  # 后端 API
```

## 访问地址

- **前端**: `http://your-domain.com:8888`
- **后端**: `http://your-domain.com:8081`

## 如果需要修改端口

### 修改前端端口

编辑以下文件中的 `listen 8888;`：
- `.github/workflows/deploy.yml`
- `scripts/deploy-manual.sh`
- `/etc/nginx/sites-available/netmaker` (VPS 上)

### 修改后端端口

编辑以下文件中的 `API_PORT=8081`：
- `/opt/netmaker/server.env` (VPS 上)

修改后重启服务：
```bash
sudo systemctl restart netmaker
sudo systemctl reload nginx
```

## 使用域名（推荐）

如果配置了域名，可以使用子域名：
- 前端: `http://app.yourdomain.com:8888`
- 后端: `http://api.yourdomain.com:8081`

## 配置 HTTPS（可选）

如果需要 HTTPS，可以使用 Certbot：

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书（需要先将 Nginx 改为监听 443）
sudo certbot --nginx -d yourdomain.com
```

注意：使用非标准端口时，HTTPS 配置会更复杂，建议使用反向代理或负载均衡器。
