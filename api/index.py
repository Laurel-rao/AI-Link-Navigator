from app import app

# 使Vercel能够导入这个app进行部署
__all__ = ['app']

# 本地测试 - 用于检测直接调用此文件的情况（通常是本地开发环境）
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0') 