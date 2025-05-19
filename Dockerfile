FROM python:3.9-slim

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# 安装依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 安装字体（为CAPTCHA功能）
RUN apt-get update && apt-get install -y \
    fonts-dejavu \
    && rm -rf /var/lib/apt/lists/*

# 复制项目文件
COPY . .

# 暴露端口
EXPOSE 5000

# 启动应用
CMD ["python", "app.py"]

# 注意：
# 1. 如果需要持久化数据，请考虑将 data.json 和 users.json 挂载为卷
# 2. 对于生产环境，建议使用更安全的方式管理密钥（而不是 os.urandom）
# 3. 生产环境中，应该使用更适合的 WSGI 服务器，如 gunicorn

# 示例运行命令：
# 开发/测试用途（不挂载卷）:
# docker build -t ai-link-navigator .
# docker run -p 5000:5000 ai-link-navigator

# 生产用途（挂载数据卷）:
# docker build -t ai-link-navigator .
# docker run -p 5000:5000 \
#   -v /path/on/host/data.json:/app/data.json \
#   -v /path/on/host/users.json:/app/users.json \
#   ai-link-navigator

# 或者使用docker-compose.yml