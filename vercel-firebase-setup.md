# Vercel与Firebase集成设置指南

本文档介绍如何在Vercel上部署集成了Firebase的AI-Link-Navigator项目。

## 前提条件

1. 已创建一个[Firebase项目](https://console.firebase.google.com/)
2. 已有一个[Vercel账户](https://vercel.com/)
3. 已将项目代码上传到GitHub仓库

## 步骤一：设置Firebase项目

1. 登录[Firebase控制台](https://console.firebase.google.com/)
2. 创建一个新项目或使用现有项目
3. 在项目设置中添加一个Web应用程序
4. 获取Firebase配置对象（包含apiKey、authDomain等）
5. 在Firebase控制台中，转到"实时数据库"并创建数据库
   - 选择"以测试模式启动"或根据需要设置安全规则
   - 记下数据库URL（通常格式为`https://your-project-id-default-rtdb.firebaseio.com`）

## 步骤二：获取Firebase Admin SDK服务账号密钥

1. 在Firebase控制台中，进入"项目设置" > "服务账号"
2. 点击"生成新的私钥"按钮下载JSON文件
3. 安全保存此文件，**不要将其提交到代码仓库！**

## 步骤三：更新Firebase配置


1. 打开项目中的`firebase_config.py`文件
2. 用您的Firebase项目信息替换配置对象中的值
   ```python
   FIREBASE_CONFIG = {
       "apiKey": "你的API密钥",
       "authDomain": "你的项目ID.firebaseapp.com",
       "databaseURL": "https://你的项目ID-default-rtdb.firebaseio.com",
       "projectId": "你的项目ID",
       "storageBucket": "你的项目ID.appspot.com",
       "messagingSenderId": "你的消息发送者ID",
       "appId": "你的应用ID"
   }
   ```


## 步骤四：在Vercel上设置环境变量

1. 在Vercel中导入你的GitHub项目
2. 进入项目设置 > 环境变量
3. 添加以下环境变量：
   - 名称：`FIREBASE_CREDENTIALS`
   - 值：将步骤二中下载的服务账号JSON文件的全部内容复制粘贴为单行文本
     (确保移除所有换行符，使其成为单行JSON字符串)
4. 点击"保存"以保存环境变量

## 步骤五：部署项目

1. 确保已将所有更改提交并推送到GitHub仓库
2. 在Vercel控制台中点击"部署"或等待自动部署
3. 部署完成后，点击生成的URL来访问您的应用程序

## 验证集成

1. 部署完成后，访问应用程序URL
2. 尝试登录（默认用户：admin，密码：A123456）
3. 验证数据是否正确保存到Firebase实时数据库

## 故障排除

### 如果应用程序无法连接到Firebase：

1. 检查环境变量`FIREBASE_CREDENTIALS`是否正确设置
2. 确认Firebase项目中的实时数据库已创建并运行
3. 检查Firebase项目的安全规则是否允许读取和写入操作

### 如果数据无法保存：

1. 检查Firebase数据库安全规则
2. 查看Vercel部署日志中的错误消息
3. 确认服务账号有足够的权限访问Firebase实时数据库

如果仍有问题，请检查Vercel的部署日志和Firebase控制台中的错误消息以获取更多详细信息。 