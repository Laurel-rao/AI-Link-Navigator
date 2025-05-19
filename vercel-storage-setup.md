# Vercel Edge Config 存储设置指南

本指南将帮助你使用Vercel的原生Edge Config存储服务来替代Firebase，用于保存用户数据和链接数据。

## 为什么使用Vercel Edge Config?

- **无需第三方依赖**：直接使用Vercel自带的存储服务
- **高性能**：Edge Config设计用于全球边缘网络的快速访问
- **简化认证**：使用Vercel项目凭证，无需管理额外的API密钥
- **适合配置和小型数据**：理想的键值对存储方案

## 设置步骤

### 1. 在Vercel中添加Edge Config

1. 登录到[Vercel Dashboard](https://vercel.com/dashboard)
2. 打开你的项目
3. 选择"Storage"选项卡
4. 点击"Add Storage"
5. 选择"Edge Config"
6. 点击"Create"按钮
7. 为Edge Config命名，例如"ai-navigator-config"
8. 在创建后，你会看到Edge Config的详细信息页面

### 2. 获取Edge Config ID和Token

1. 在Edge Config详情页面，复制"ID"值
2. 点击"Create Token"创建访问令牌
3. 为令牌命名，例如"app-token"
4. 选择适当的权限（通常需要读写权限）
5. 点击"Create"并复制生成的令牌

### 3. 配置环境变量

1. 在项目的"Settings"选项卡中选择"Environment Variables"
2. 添加以下两个环境变量：
   - `EDGE_CONFIG_ID`: 粘贴你的Edge Config ID
   - `EDGE_CONFIG_TOKEN`: 粘贴你生成的访问令牌
3. 点击"Save"保存环境变量

### 4. 将Edge Config连接到项目

1. 回到Edge Config详情页面
2. 点击"Connect Project"
3. 选择你的项目
4. 点击"Connect"

### 5. 初始化Edge Config (可选)

你可以使用Vercel Dashboard或API手动添加初始数据：

1. 在Edge Config详情页面，点击"Items"选项卡
2. 点击"Add Item"
3. 添加以下两个键：
   - `users`: 添加一个包含管理员用户的JSON数组
   - `links_data`: 添加包含初始链接的JSON对象

或者，应用程序会在首次运行时自动初始化默认数据。

## 验证设置

1. 重新部署你的Vercel项目
2. 尝试登录应用程序
3. 检查Vercel日志以确认是否正在使用Edge Config
4. 在Edge Config详情页面的"Items"选项卡中验证数据是否正确保存

## 故障排除

如果遇到问题：

1. 检查环境变量是否正确设置
2. 确认Edge Config Token有足够的权限
3. 查看Vercel部署日志中的错误信息
4. 确保Edge Config已连接到项目

## 本地开发

对于本地开发，应用会自动回退到使用本地JSON文件。如果你想在本地测试Edge Config：

1. 获取Edge Config ID和Token
2. 在本地设置环境变量：
   ```bash
   # Windows (cmd)
   set EDGE_CONFIG_ID=你的Edge_Config_ID
   set EDGE_CONFIG_TOKEN=你的Token
   
   # Windows (PowerShell)
   $env:EDGE_CONFIG_ID="你的Edge_Config_ID"
   $env:EDGE_CONFIG_TOKEN="你的Token"
   
   # Linux/macOS
   export EDGE_CONFIG_ID=你的Edge_Config_ID
   export EDGE_CONFIG_TOKEN=你的Token
   ```
3. 运行应用程序 