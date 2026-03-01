# Netmaker 使用指南

## 创建网络后的完整流程

### 第一步：创建网络 ✅

你已经完成了这一步！现在你有了一个虚拟网络（例如：`10.10.10.0/24`）

---

## 第二步：添加主机到网络

### 方式 1：使用 Enrollment Key（推荐）

#### 1. 在 Web 界面创建 Enrollment Key

1. 访问 http://nm.icta.top:8888
2. 进入你创建的网络
3. 点击 **"Enrollment Keys"** 或 **"Access Keys"**
4. 点击 **"Create Enrollment Key"**
5. 配置：
   - **Name**: 给密钥起个名字（如 `my-laptop-key`）
   - **Uses**: 可使用次数（如 `1` 表示一次性，`0` 表示无限次）
   - **Expiration**: 过期时间（可选）
6. 点击 **"Create"**
7. **复制生成的 Token**（类似：`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`）

#### 2. 在客户端设备上安装 Netclient

**Linux/Mac:**
```bash
# 下载并安装 netclient
curl -sL 'https://apt.netmaker.org/gpg.key' | sudo tee /etc/apt/trusted.gpg.d/netmaker.asc
curl -sL 'https://apt.netmaker.org/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/netmaker.list
sudo apt update
sudo apt install netclient

# 或者直接下载二进制文件
wget https://github.com/gravitl/netmaker/releases/latest/download/netclient-linux-amd64
chmod +x netclient-linux-amd64
sudo mv netclient-linux-amd64 /usr/local/bin/netclient
```

**Windows:**
- 下载 Windows 安装包：https://github.com/gravitl/netmaker/releases
- 运行安装程序

#### 3. 使用 Token 加入网络

```bash
# 使用 enrollment key 注册
sudo netclient register -t <YOUR_TOKEN>

# 示例
sudo netclient register -t eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**或者使用完整命令：**
```bash
sudo netclient register \
  -t <YOUR_TOKEN> \
  --server http://api.nm.icta.top:8081
```

---

### 方式 2：手动添加主机（高级）

如果你的 VPS 本身也要加入网络：

```bash
# 在 VPS 上安装 netclient
sudo apt update
sudo apt install wireguard

# 下载 netclient
wget https://github.com/gravitl/netmaker/releases/latest/download/netclient-linux-amd64
chmod +x netclient-linux-amd64
sudo mv netclient-linux-amd64 /usr/local/bin/netclient

# 使用 enrollment key 加入
sudo netclient register -t <YOUR_TOKEN>
```

---

## 第三步：验证连接

### 在 Web 界面查看

1. 访问 http://nm.icta.top:8888
2. 进入你的网络
3. 点击 **"Hosts"** 或 **"Nodes"**
4. 你应该能看到已连接的设备及其分配的 IP 地址

### 在客户端测试连接

```bash
# 查看 WireGuard 接口
sudo wg show

# 查看网络接口
ip addr show

# 你应该能看到类似 nm-<network-name> 的接口
# 例如：nm-mynet

# 测试 ping 其他节点
ping <其他节点的虚拟IP>
```

---

## 第四步：配置访问控制（可选）

### 设置 ACL（Access Control List）

1. 在 Web 界面进入你的网络
2. 点击 **"ACLs"** 或 **"Access Control"**
3. 配置哪些节点可以互相通信
4. 默认情况下，如果你创建网络时启用了 **"Default ACL"**，所有节点都可以互相通信

---

## 第五步：配置网关（可选）

### Egress Gateway（出口网关）

允许网络中的节点访问外部网络或互联网。

**使用场景**：
- 让远程设备通过 VPS 访问互联网
- 访问 VPS 所在的本地网络

**配置步骤**：
1. 在 Web 界面选择一个节点（通常是 VPS）
2. 点击 **"Create Egress"**
3. 配置：
   - **Egress Gateway Ranges**: 要路由的 IP 范围（如 `0.0.0.0/0` 表示所有流量）
   - **Interface**: 出口网络接口（如 `eth0`）
4. 点击 **"Create"**

### Ingress Gateway（入口网关）

允许外部设备通过简单的 WireGuard 配置文件加入网络。

**使用场景**：
- 为手机、平板等移动设备创建 VPN 配置
- 为不能安装 netclient 的设备提供访问

**配置步骤**：
1. 选择一个节点作为 Ingress Gateway
2. 点击 **"Create Ingress"**
3. 生成 External Client 配置
4. 下载 WireGuard 配置文件
5. 在移动设备上导入配置

---

## 第六步：配置 DNS（可选）

### 添加自定义 DNS 记录

1. 在 Web 界面点击 **"DNS"**
2. 点击 **"Create DNS Entry"**
3. 配置：
   - **Name**: 域名（如 `server1.mynet`）
   - **Address**: IP 地址（节点的虚拟 IP）
   - **Network**: 选择你的网络
4. 点击 **"Create"**

现在网络中的所有节点都可以通过域名访问其他节点：
```bash
ping server1.mynet
```

---

## 常用操作

### 查看节点状态

```bash
# 查看 netclient 状态
sudo netclient status

# 查看所有网络
sudo netclient list

# 查看 WireGuard 配置
sudo wg show
```

### 断开连接

```bash
# 离开网络
sudo netclient leave <network-name>

# 完全卸载
sudo netclient uninstall
```

### 更新配置

```bash
# 拉取最新配置
sudo netclient pull
```

---

## 典型使用场景

### 场景 1：远程办公 VPN

1. 创建网络（如 `office-vpn`）
2. VPS 作为 Egress Gateway
3. 员工设备安装 netclient 并加入网络
4. 所有设备可以互相访问，并通过 VPS 访问公司资源

### 场景 2：多云互联

1. 创建网络（如 `multi-cloud`）
2. 在每个云服务器上安装 netclient
3. 所有服务器自动建立 mesh 网络
4. 服务器之间可以直接通信，无需公网 IP

### 场景 3：IoT 设备管理

1. 创建网络（如 `iot-network`）
2. 在每个 IoT 设备上安装 netclient
3. 通过虚拟 IP 管理所有设备
4. 配置 ACL 控制设备间的访问权限

---

## 故障排查

### 节点无法连接

```bash
# 检查 netclient 日志
sudo journalctl -u netclient -f

# 检查 WireGuard 状态
sudo wg show

# 检查防火墙
sudo ufw status

# 测试到服务器的连接
curl http://api.nm.icta.top:8081/api/server/health
```

### 无法 ping 通其他节点

1. 检查 ACL 配置
2. 检查防火墙规则
3. 确认两个节点都在线
4. 检查 UDP Hole Punching 是否启用

---

## 下一步学习

- [Netmaker 官方文档](https://docs.netmaker.io)
- [WireGuard 文档](https://www.wireguard.com)
- [视频教程](https://www.youtube.com/channel/UCach3lJY_xBV7rGrbUSvkZQ)

---

## 快速参考

### 重要端口

- **8888**: 前端 Web 界面
- **8081**: 后端 API
- **51821**: WireGuard 默认端口（UDP）

### 重要路径

- **配置文件**: `/etc/netclient/`
- **日志**: `journalctl -u netclient`
- **WireGuard 配置**: `/etc/wireguard/`

### 常用命令

```bash
# 查看状态
sudo netclient status

# 拉取配置
sudo netclient pull

# 离开网络
sudo netclient leave <network>

# 查看日志
sudo journalctl -u netclient -f
```
