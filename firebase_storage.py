"""
Firebase存储模块
提供与Firebase实时数据库交互的函数
"""

import firebase_admin
from firebase_admin import credentials, db
from firebase_config import FIREBASE_CONFIG
import json
import os
import sys  # 添加sys以获取更多错误信息

# 存储Firebase实例的全局变量，避免重复初始化
firebase_app = None

def initialize_firebase():
    """初始化Firebase连接"""
    global firebase_app
    if firebase_app is not None:
        print("已有Firebase实例，直接返回")
        return firebase_app
    
    print("=== Firebase初始化开始 ===")
    print(f"Python版本: {sys.version}")
    print(f"运行环境: {os.environ.get('VERCEL_ENV', '非Vercel环境')}")
    
    try:
        # 检查是否在Vercel环境中运行
        is_vercel = os.environ.get('VERCEL') == '1'
        print(f"是否在Vercel环境中: {is_vercel}")
        print(f"所有环境变量键: {list(os.environ.keys())}")
        
        # 打印Firebase配置信息（不包含敏感信息）
        safe_config = {k: v for k, v in FIREBASE_CONFIG.items() if k not in ['apiKey', 'appId']}
        print(f"Firebase配置信息: {safe_config}")
        
        # 使用环境变量中的凭据（安全）或配置文件（本地开发）
        if is_vercel and os.environ.get('FIREBASE_CREDENTIALS'):
            print("使用FIREBASE_CREDENTIALS环境变量")
            try:
                cred_json = os.environ.get('FIREBASE_CREDENTIALS')
                # 打印JSON长度，帮助检查是否完整
                print(f"凭据JSON长度: {len(cred_json)}")
                cred_dict = json.loads(cred_json)
                print("成功解析凭据JSON")
                cred = credentials.Certificate(cred_dict)
                print("成功创建凭据证书")
            except json.JSONDecodeError as je:
                print(f"JSON解析错误: {je}")
                print(f"凭据开头10个字符: {cred_json[:10]}...")
                raise
        else:
            print("使用本地服务账号文件")
            # 本地开发：使用服务账号密钥文件
            # 如果没有service-account.json文件，需要先从Firebase控制台下载
            if os.path.exists('service-account.json'):
                print("找到service-account.json文件")
                cred = credentials.Certificate('service-account.json')
                print("成功加载服务账号密钥")
            else:
                print("未找到服务账号文件，尝试匿名访问")
                # 如果没有凭据文件，使用配置对象进行匿名访问
                # 注意：这仅适用于测试/开发环境
                print(f"数据库URL: {FIREBASE_CONFIG['databaseURL']}")
                firebase_app = firebase_admin.initialize_app(None, {
                    'databaseURL': FIREBASE_CONFIG['databaseURL']
                })
                print("成功初始化匿名Firebase应用")
                return firebase_app
        
        # 初始化应用
        print("开始初始化Firebase应用")
        firebase_app = firebase_admin.initialize_app(cred, {
            'databaseURL': FIREBASE_CONFIG['databaseURL']
        })
        print("成功初始化Firebase应用")
        return firebase_app
    except Exception as e:
        print(f"Firebase初始化错误: {e}")
        print(f"错误类型: {type(e).__name__}")
        print(f"详细跟踪信息: {sys.exc_info()}")
        # 尝试打印更多详细的错误跟踪
        import traceback
        print(f"错误堆栈: {traceback.format_exc()}")
        return None

# 用户数据操作
def load_users():
    """从Firebase加载用户数据"""
    try:
        print("尝试加载用户数据...")
        app = initialize_firebase()
        if not app:
            print("Firebase初始化失败，尝试从本地加载")
            return _load_users_from_file()
        
        ref = db.reference('/users')
        print("成功创建数据库引用")
        users_data = ref.get()
        print(f"获取到用户数据: {users_data is not None}")
        if users_data is None:
            print("未找到用户数据，返回空列表")
            return []
        # 将字典转换为列表（Firebase存储为键值对）
        users_list = [user_data for user_id, user_data in users_data.items()]
        print(f"返回用户列表，包含{len(users_list)}个用户")
        return users_list
    except Exception as e:
        print(f"加载用户数据错误: {e}")
        print(f"错误堆栈: {traceback.format_exc()}")
        # 发生错误时，尝试从本地文件加载
        return _load_users_from_file()

def save_users(users):
    """保存用户数据到Firebase"""
    try:
        print(f"尝试保存{len(users)}个用户到Firebase...")
        app = initialize_firebase()
        if not app:
            print("Firebase初始化失败，保存到本地")
            return _save_users_to_file(users)
            
        # 转换用户列表为以用户名为键的字典
        users_dict = {user['username']: user for user in users}
        print(f"用户字典创建成功，包含{len(users_dict)}个用户")
        ref = db.reference('/users')
        print("成功创建用户数据引用")
        ref.set(users_dict)
        print("用户数据成功保存到Firebase")
        return True
    except Exception as e:
        print(f"保存用户数据错误: {e}")
        print(f"错误类型: {type(e).__name__}")
        import traceback
        print(f"错误堆栈: {traceback.format_exc()}")
        # 发生错误时，保存到本地文件作为备份
        return _save_users_to_file(users)

# 链接数据操作
def load_data():
    """从Firebase加载链接数据"""
    try:
        print("尝试从Firebase加载链接数据...")
        app = initialize_firebase()
        if not app:
            print("Firebase初始化失败，从本地加载链接数据")
            return _load_data_from_file()
            
        ref = db.reference('/links_data')
        print("成功创建链接数据引用")
        data = ref.get()
        print(f"获取链接数据结果: {data is not None}")
        
        if data is None:
            print("未找到链接数据，返回空组")
            return {'groups': []}
            
        if isinstance(data, dict) and 'groups' in data:
            print(f"成功获取链接数据，包含{len(data['groups'])}个分组")
        else:
            print(f"获取的数据格式不符合预期: {type(data)}")
            
        return data
    except Exception as e:
        print(f"加载链接数据错误: {e}")
        print(f"错误类型: {type(e).__name__}")
        import traceback
        print(f"错误堆栈: {traceback.format_exc()}")
        # 发生错误时，尝试从本地文件加载
        return _load_data_from_file()

def save_data(content):
    """保存链接数据到Firebase"""
    try:
        print("尝试保存链接数据到Firebase...")
        if not isinstance(content, dict) or 'groups' not in content:
            print(f"数据格式不正确: {type(content)}")
            
        if isinstance(content, dict) and 'groups' in content:
            print(f"准备保存链接数据，包含{len(content['groups'])}个分组")
        
        app = initialize_firebase()
        if not app:
            print("Firebase初始化失败，保存到本地文件")
            return _save_data_to_file(content)
            
        ref = db.reference('/links_data')
        print("成功创建链接数据引用")
        ref.set(content)
        print("链接数据成功保存到Firebase")
        return True
    except Exception as e:
        print(f"保存链接数据错误: {e}")
        print(f"错误类型: {type(e).__name__}")
        import traceback
        print(f"错误堆栈: {traceback.format_exc()}")
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