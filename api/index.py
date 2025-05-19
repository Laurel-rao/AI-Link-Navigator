from flask import Flask, request, jsonify, send_from_directory, session, redirect, url_for
import sys
import os

# 将项目根目录添加到Python路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 导入主应用
from app import app

# 将这个文件作为Vercel的入口点
if __name__ == "__main__":
    app.run()