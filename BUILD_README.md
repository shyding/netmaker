# Netmaker 前后端编译指南

## 快速开始

### 一键编译

根据你的操作系统选择对应的脚本：

**Linux / Mac / Cygwin (Bash)**
```bash
./build-all.sh
```

**Windows CMD (批处理)**
```cmd
build-all.bat
```

**Windows PowerShell (推荐)**
```powershell
.\build-all.ps1
```

> 注意: 如果 PowerShell 提示执行策略错误，请以管理员身份运行：
> ```powershell
> Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

这个脚本会自动完成以下操作：
1. 清理旧的构建文件
2. 编译后端 Go 程序
3. 编译前端 React 应用
4. 生成配置文件
5. 创建启动脚本

## 编译要求

### 必需软件

- **Go 1.25+** - 后端编译
- **Node.js 17+** - 前端编译
- **npm** - 前端包管理
- **GCC/CGO** - Go 的 C 语言支持（用于 SQLite）

### 检查环境

```bash
# 检查 Go
go version

# 检查 Node.js
node --version

# 检查 npm
npm --version

# 检查 GCC（Cygwin）
gcc --version
```

## 使用方法

### 1. 编译项目

**Linux / Mac / Cygwin:**
```bash
cd /path/to/netmaker
./build-all.sh
```

**Windows CMD:**
```cmd
cd I:\learn_code\netmaker
build-all.bat
```

**Windows PowerShell:**
```powershell
cd I:\learn_code\netmaker
.\build-all.ps1
```

编译完成后，所有文件会输出到 `build/` 目录。

### 2. 启动服务

#### 方式一：一键启动（推荐）

**Linux / Mac / Cygwin:**
```bash
cd build
./start-all.sh
```

**Windows CMD:**
```cmd
cd build
start-all.bat
```

**Windows PowerShell:**
```powershell
cd build
.\start-all.ps1
```

这会同时启动前后端服务：
- 前端: http://localhost:3000
- 后端: http://localhost:8081

#### 方式二：分别启动

**Linux / Mac / Cygwin:**
```bash
# 终端 1 - 启动后端
cd build
./start-backend.sh

# 终端 2 - 启动前端
cd build
./start-frontend.sh
```

**Windows PowerShell:**
```powershell
# 终端 1 - 启动后端
cd build
.\start-backend.ps1

# 终端 2 - 启动前端
cd build
.\start-frontend.ps1
```

**Windows CMD:**
```cmd
REM 终端 1 - 启动后端
cd build
start-backend.bat

REM 终端 2 - 启动前端
cd build
start-frontend.bat
```

## 配置说明

### 后端配置

编辑 `build/backend/server.env`：

```bash
# 服务器配置
SERVER_HOST=0.0.0.0
API_PORT=8081

# 安全配置
MASTER_KEY=your-secret-key-here  # 请修改为强密码

# 数据库配置
DATABASE=sqlite
SQL_CONN=netmaker.db

# CORS 配置
CORS_ALLOWED_ORIGIN=http://localhost:3000

# API 地址
SERVER_HTTP_HOST=http://localhost:8081
```

### 前端配置

编辑 `build/frontend/config.js`：

```javascript
window.REACT_APP_BACKEND = "http://localhost:8081";
```

## 目录结构

```
build/
├── backend/
│   ├── netmaker          # 后端可执行文件
│   ├── server.env        # 后端配置文件
│   └── config/           # 配置目录
├── frontend/
│   ├── index.html        # 前端入口
│   ├── config.js         # 前端配置
│   └── static/           # 静态资源
├── start-backend.sh      # 后端启动脚本
├── start-frontend.sh     # 前端启动脚本
└── start-all.sh          # 一键启动脚本
```

## 常见问题

### 1. 编译失败

**Go 编译错误**：
```bash
# 确保安装了 GCC
gcc --version

# 重新下载依赖
cd netmaker
go mod download
go mod tidy
```

**前端编译错误**：
```bash
# 清理并重新安装
cd netmaker-ui
rm -rf node_modules package-lock.json
npm install
```

### 2. 启动失败

**后端无法启动**：
- 检查端口 8081 是否被占用
- 检查数据库文件权限
- 查看日志输出

**前端无法访问**：
- 检查端口 3000 是否被占用
- 确认后端已启动
- 检查 `config.js` 中的 API 地址

### 3. CORS 错误

如果前端无法访问后端 API，修改后端配置：

```bash
# 在 build/backend/server.env 中
CORS_ALLOWED_ORIGIN=http://localhost:3000
```

### 4. 在生产环境部署

生产环境建议使用 Docker 或配置 Nginx：

**使用 Nginx**：
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端
    location / {
        root /path/to/build/frontend;
        try_files $uri /index.html;
    }

    # 后端 API
    location /api {
        proxy_pass http://localhost:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 开发模式

如果需要开发模式（热重载）：

### 后端开发

```bash
cd netmaker
go run main.go
```

### 前端开发

```bash
cd netmaker-ui
npm start
```

前端开发服务器会自动在 http://localhost:3000 启动。

## 重新编译

如果修改了代码，重新运行编译脚本：

```bash
./build-all.sh
```

脚本会自动清理旧文件并重新编译。

## 技术栈

### 后端
- Go 1.25+
- Gorilla Mux (路由)
- SQLite (数据库)
- JWT (认证)

### 前端
- React 17
- TypeScript
- Material-UI
- Redux + Redux Saga
- Axios

## 支持

如有问题，请访问：
- GitHub: https://github.com/gravitl/netmaker
- Discord: https://discord.gg/zRb9Vfhk8A
- 文档: https://docs.netmaker.io
