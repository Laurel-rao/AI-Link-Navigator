# 在 Vercel 上部署 AI-Link-Navigator

本文档提供了如何在 Vercel 上部署 AI-Link-Navigator 的完整步骤指南。

## 先决条件

1. 一个 GitHub 账号
2. 一个 Vercel 账号（可以直接使用 GitHub 账号登录）

## 部署步骤

### 1. Fork 仓库 (可选)

如果您想要自己的独立版本，可以先 Fork 这个仓库到您自己的 GitHub 账号。

### 2. 在 Vercel 上导入项目

1. 登录 [Vercel](https://vercel.com)
2. 点击 "New Project" 按钮
3. 选择 "Import Git Repository" 
4. 选择您要部署的 GitHub 仓库（如果您 Fork 了，选择您的 Fork）
5. Vercel 会自动检测到这是一个 Python 项目

### 3. 项目配置

项目配置应该会自动设置，因为我们已经添加了 `vercel.json` 文件。但您可以根据需要添加环境变量：

- 您可以在 "Environment Variables" 部分添加以下可选环境变量：
  - `SECRET_KEY`: 用于加密会话的密钥（如不设置将使用默认值）

### 4. 点击部署

点击 "Deploy" 按钮开始部署过程。

### 5. 访问您的应用

部署完成后，Vercel 会提供一个域名（例如 `your-app-name.vercel.app`），您可以通过该域名访问您的应用。

## 重要注意事项

### 无服务器环境的限制

由于 Vercel 是无服务器(serverless)环境，有一些限制需要注意：

1. **文件系统**: Vercel 函数无法永久写入文件系统。这意味着：
   - 每次部署或函数冷启动时，`data.json` 和 `users.json` 将被重置为默认状态
   - 所有用户更改和数据修改将在一段时间不活动后丢失

### 替代方案

如果您需要持久化数据存储，可以考虑以下方案：

1. **使用数据库**: 修改应用以使用 MongoDB、Firebase 或其他云数据库
2. **使用 Vercel KV 或 Edge Config**: 将数据存储在 Vercel 的 KV 存储中
3. **部署到传统服务器**: 考虑部署到 DigitalOcean、Heroku 等支持持久文件系统的平台

## 自定义域名 (可选)

1. 在 Vercel 项目设置中点击 "Domains"
2. 添加您自己的域名
3. 按照 Vercel 提供的说明配置 DNS 记录

## 问题排查

如果您在部署过程中遇到问题：

1. 检查 Vercel 构建日志
2. 确保您的代码与 Vercel 兼容（不依赖于写入本地文件系统等）
3. 检查是否有任何依赖项未在 `requirements.txt` 中列出