# AI链接导航站

一个具有科技感风格的链接导航网站，使用毛玻璃效果和Apple UI/UX风格设计。

## 特点

- 现代化的UI设计，具有科技感
- 毛玻璃效果和Apple风格的界面元素
- 响应式设计，适配各种设备
- 基于JSON的数据管理 (分组链接 `data.json`, 用户信息 `users.json`)
- 简单易用的管理后台，包含链接管理和用户管理两大模块
- 链接管理支持：搜索、排序、分组描述悬浮提示、链接描述悬浮提示
- 用户管理支持：添加用户、删除用户、修改用户角色和密码 (编辑功能简化，推荐删除后重建)
- 基于角色的登录保护功能 (管理员和普通用户)，密码哈希存储

## 登录


- 访问应用时会首先跳转到登录页面。
- **默认管理员账号**: `admin` / **密码**: `A123456`
  - 可以访问所有页面，包括管理后台所有功能。
- **默认普通用户账号**: `user` / **密码**: `U123456`
  - 可以访问主导航页，但不能访问管理后台。

## 文件结构

- `login.html` - 登录页面
- `index.html` - 主页面，展示所有链接分组 (登录后可见)
- `admin.html` - 管理后台 (仅管理员可见)，包含链接管理和用户管理模块
- `data.json` - 存储链接数据的JSON文件 (包含 `order` 字段用于排序)
- `users.json` - 存储用户账号、哈希密码和角色的JSON文件
- `app.py` - Python Flask后端程序 (包含登录逻辑、用户管理API、角色管理和会话管理)
- `requirements.txt` - Python依赖文件
- `start.sh` - Linux/Mac启动脚本
- `start.bat` - Windows启动脚本

## 技术栈

- HTML5
- Tailwind CSS (通过CDN加载)
- 原生JavaScript
- Python Flask (后端服务，包括会话、角色管理、密码哈希)
- Werkzeug (用于密码哈希)

## 如何使用

1.  确保安装了Python 3.6+
2.  根据操作系统执行启动脚本 (`./start.sh` 或 `start.bat`)。
    首次运行时，`users.json` 中的初始明文密码会被自动哈希并覆盖。
3.  启动成功后，在浏览器中访问 `http://localhost:5000`。您将被引导至登录页面。
4.  根据您的角色登录。

## 管理后台使用说明 (管理员专属)

管理后台现在分为两个标签页：**链接管理** 和 **用户管理**。

### 链接管理

- 与之前版本类似，可以搜索、添加、编辑（标题、描述、排序号）、删除分组和链接。
- 分组和链接的描述会通过 `ⓘ` 图标悬浮显示。
- 修改排序号后列表会立即重新排序。
- 点击页面右下角悬浮的"保存更改 (仅链接管理)"按钮保存对 `data.json` 的修改。

### 用户管理

1.  切换到"用户管理"标签页。
2.  **查看用户**：列出现有的所有用户及其角色。
3.  **添加新用户**：
    *   填写用户名、密码、选择角色（admin 或 user）。
    *   点击"创建用户"。
4.  **删除用户**：
    *   点击用户旁的"删除"按钮。
    *   不能删除当前登录的管理员。
    *   不能删除唯一的管理员账户。
5.  **编辑用户** (简化)：
    *   目前"编辑"按钮会提示功能未完全实现。
    *   如需修改用户密码或角色，请先删除该用户，然后使用新的密码或角色重新创建。
6.  **注意**：用户管理的操作会直接修改 `users.json` 文件，无需额外点击"保存更改"按钮（该按钮仅用于链接管理）。

### 通用

- **退出登录**：点击页面右上角的"退出登录"链接。

## 注意事项

- 密码在 `users.json` 中以哈希形式存储，请勿手动编辑此文件中的 `password_hash` 字段，除非您知道如何生成兼容的哈希值。
- 如果 `users.json` 文件丢失或内容为空，首次启动 `app.py` 时会自动重新创建包含默认 `admin` 和 `user` 账户的 `users.json` 文件，并将密码哈希化。

## 自定义

- 可以在各 HTML 文件的Tailwind配置中修改颜色和样式。
- 登录凭据（初始）和用户角色定义在 `app.py` 中（用于首次创建 `users.json`），之后用户管理通过后台界面进行。

构建一个页面，每个分组是一个卡片，每个小链接可以点击跳转到具体链接，请使用科技感风格 + 毛玻璃 + apple UI/UX 风格, 请构造一个 json 文件存储，并通过另一个管理后台进行编辑，
该网站使用  tailwindcss + cdn 构建 html


- AI决策 (分组描述)
    - AI数据决策  https://ai.cn/aaa1
    - AI历史决策  https://ai.cn/aaa2
    - AI智能决策  https://ai.cn/aaa3

- AI顾问 (分组描述2)
    - AI智能决策 https://ai.cn/aaa4
    - AI法律顾问 https://ai.cn/aaa5 
    - AI经济顾问 https://ai.cn/aaa6
    - AI历史顾问 https://ai.cn/aaa7

... 等等

## Vercel Edge Config集成

本项目现已集成Vercel Edge Config用于数据存储，替代了Firebase。这一变更解决了以下问题：

1. 避免Firebase凭据问题
2. 解决Vercel只读文件系统限制
3. 利用Vercel原生服务提高性能和可靠性

要启用Edge Config存储功能，请参考`vercel-storage-setup.md`文件中的详细说明。

### Vercel环境变量配置

要在Vercel上成功部署并使用Edge Config存储，必须正确配置以下环境变量：

1. 在Vercel仪表板(https://vercel.com)登录并进入项目
2. 点击"Settings" > "Environment Variables"
3. 添加以下两个环境变量：
   - `edge-config-id`：您的Edge Config ID
   - `edge-config-token`：您的Edge Config访问令牌

**注意**：
- 这些变量名必须与vercel.json中引用的变量名完全一致
- 变量值必须是从Vercel Edge Config设置页面获取的有效ID和令牌
- 部署错误`Error: Environment Variable "EDGE_CONFIG_ID" references Secret "edge-config-id", which does not exist`表示您尚未添加这些环境变量

完成环境变量设置后，应用将自动使用Edge Config进行数据存储，无需修改任何代码。
