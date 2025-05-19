"""
Firebase配置文件

在使用此模块前，请确保您已经:
1. 创建了Firebase项目: https://console.firebase.google.com/
2. 启用了Realtime Database
3. 下载了服务账号密钥JSON文件，并保存为 'firebase-key.json'
   或在环境变量中设置Firebase凭据信息
"""

import os
import json
import firebase_admin
from firebase_admin import credentials, db

# Firebase连接状态
_firebase_initialized = False
_db_ref = None

def initialize_firebase():
    """初始化Firebase连接"""
    global _firebase_initialized, _db_ref
    
    if _firebase_initialized:
        return _db_ref
    
    try:
        # 方法1: 使用JSON文件（本地开发）
        if os.path.exists('firebase-key.json'):
            cred = credentials.Certificate('firebase-key.json')
        # 方法2: 使用环境变量（Vercel部署）
        elif os.environ.get('FIREBASE_CONFIG'):
            firebase_config = json.loads(os.environ.get('FIREBASE_CONFIG'))
            cred = credentials.Certificate(firebase_config)
        else:
            raise ValueError("Firebase凭据未找到。请确保firebase-key.json文件存在或FIREBASE_CONFIG环境变量已设置。")
        
        # 初始化应用
        firebase_admin.initialize_app(cred, {
            'databaseURL': os.environ.get('FIREBASE_DATABASE_URL', 'https://ai-link-navigator-default-rtdb.firebaseio.com/')
        })
        
        # 获取数据库根引用
        _db_ref = db.reference('/')
        _firebase_initialized = True
        print("Firebase连接成功初始化.")
        
        return _db_ref
    
    except Exception as e:
        print(f"Firebase初始化失败: {e}")
        return None

def get_db_ref(path=None):
    """获取数据库引用，可选择指定路径"""
    if not _firebase_initialized:
        initialize_firebase()
    
    if path:
        return db.reference(path)
    return _db_ref