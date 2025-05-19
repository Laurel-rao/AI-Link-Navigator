"""
Firebase存储模块
提供与Firebase实时数据库交互的函数
"""

import firebase_admin
from firebase_admin import credentials, db
from firebase_config import FIREBASE_CONFIG
import json
import os

# 存储Firebase实例的全局变量，避免重复初始化
firebase_app = None

def initialize_firebase():
    """初始化Firebase连接"""
    global firebase_app
    if firebase_app is not None:
        return firebase_app
    
    try:
        # 检查是否在Vercel环境中运行
        is_vercel = os.environ.get('VERCEL') == '1'
        
        # 使用环境变量中的凭据（安全）或配置文件（本地开发）
        if is_vercel and os.environ.get('FIREBASE_CREDENTIALS'):
            # 从环境变量获取凭据
            cred_dict = json.loads(os.environ.get('FIREBASE_CREDENTIALS'))
            cred = credentials.Certificate(cred_dict)
        else:
            # 本地开发：使用服务账号密钥文件
            # 如果没有service-account.json文件，需要先从Firebase控制台下载
            if os.path.exists('service-account.json'):
                cred = credentials.Certificate('service-account.json')
            else:
                # 如果没有凭据文件，使用配置对象进行匿名访问
                # 注意：这仅适用于测试/开发环境
                firebase_app = firebase_admin.initialize_app(None, {
                    'databaseURL': FIREBASE_CONFIG['databaseURL']
                })
                return firebase_app
        
        # 初始化应用
        firebase_app = firebase_admin.initialize_app(cred, {
            'databaseURL': FIREBASE_CONFIG['databaseURL']
        })
        return firebase_app
    except Exception as e:
        print(f"Firebase初始化错误: {e}")
        return None

# 用户数据操作
def load_users():
    """从Firebase加载用户数据"""
    try:
        initialize_firebase()
        ref = db.reference('/users')
        users_data = ref.get()
        if users_data is None:
            return []
        # 将字典转换为列表（Firebase存储为键值对）
        return [user_data for user_id, user_data in users_data.items()]
    except Exception as e:
        print(f"加载用户数据错误: {e}")
        # 发生错误时，尝试从本地文件加载
        return _load_users_from_file()

def save_users(users):
    """保存用户数据到Firebase"""
    try:
        initialize_firebase()
        # 转换用户列表为以用户名为键的字典
        users_dict = {user['username']: user for user in users}
        ref = db.reference('/users')
        ref.set(users_dict)
        return True
    except Exception as e:
        print(f"保存用户数据错误: {e}")
        # 发生错误时，保存到本地文件作为备份
        return _save_users_to_file(users)

# 链接数据操作
def load_data():
    """从Firebase加载链接数据"""
    try:
        initialize_firebase()
        ref = db.reference('/links_data')
        data = ref.get()
        if data is None:
            return {'groups': []}
        return data
    except Exception as e:
        print(f"加载链接数据错误: {e}")
        # 发生错误时，尝试从本地文件加载
        return _load_data_from_file()

def save_data(content):
    """保存链接数据到Firebase"""
    try:
        initialize_firebase()
        ref = db.reference('/links_data')
        ref.set(content)
        return True
    except Exception as e:
        print(f"保存链接数据错误: {e}")
        # 发生错误时，保存到本地文件作为备份
        return _save_data_to_file(content)

# 本地文件备份操作（当Firebase不可用时使用）
def _load_users_from_file():
    """从本地文件加载用户数据（备用方法）"""
    users_file = 'users.json'
    if not os.path.exists(users_file):
        return []
    try:
        with open(users_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"从文件加载用户数据错误: {e}")
        return []

def _save_users_to_file(users):
    """保存用户数据到本地文件（备用方法）"""
    users_file = 'users.json'
    try:
        with open(users_file, 'w', encoding='utf-8') as f:
            json.dump(users, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(f"保存用户数据到文件错误: {e}")
        return False

def _load_data_from_file():
    """从本地文件加载链接数据（备用方法）"""
    data_file = 'data.json'
    if not os.path.exists(data_file):
        return {'groups': []}
    try:
        with open(data_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"从文件加载链接数据错误: {e}")
        return {'groups': []}

def _save_data_to_file(content):
    """保存链接数据到本地文件（备用方法）"""
    data_file = 'data.json'
    try:
        with open(data_file, 'w', encoding='utf-8') as f:
            json.dump(content, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(f"保存链接数据到文件错误: {e}")
        return False

# 初始化数据
def initialize_default_data():
    """初始化默认数据到Firebase（如果不存在）"""
    # 初始化用户数据
    users = load_users()
    if not users:
        default_users = [
            {"username": "admin", "password_hash": None, "_password_plaintext_initial": "A123456", "role": "admin"},
            {"username": "user", "password_hash": None, "_password_plaintext_initial": "U123456", "role": "user"}
        ]
        save_users(default_users)
        # 重新加载，以便处理密码哈希
        from werkzeug.security import generate_password_hash
        for user in default_users:
            if "_password_plaintext_initial" in user and user["_password_plaintext_initial"]:
                user["password_hash"] = generate_password_hash(user["_password_plaintext_initial"])
                del user["_password_plaintext_initial"]
        save_users(default_users)
    
    # 初始化链接数据
    data = load_data()
    if not data or 'groups' not in data or not data['groups']:
        empty_data = {'groups': []}
        save_data(empty_data) 