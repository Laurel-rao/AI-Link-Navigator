"""
Firebase数据存储模块

用于将原本的文件IO操作替换为Firebase Realtime Database操作
"""

import json
from firebase_admin import db
from firebase_config import get_db_ref, initialize_firebase

# 确保Firebase已初始化
initialize_firebase()

# 数据存储路径常量
USERS_PATH = '/users'
DATA_PATH = '/data'

# ===== 用户管理相关函数 =====
def load_users():
    """从Firebase加载用户数据"""
    try:
        users_ref = get_db_ref(USERS_PATH)
        users_data = users_ref.get()
        
        # Firebase返回None表示节点不存在
        if users_data is None:
            return []
        
        # Firebase返回字典，需要转换为列表
        if isinstance(users_data, dict):
            return list(users_data.values())
        
        return []
    except Exception as e:
        print(f"加载用户数据失败: {e}")
        return []

def save_users(users):
    """保存用户数据到Firebase"""
    try:
        users_ref = get_db_ref(USERS_PATH)
        
        # 清除现有数据
        users_ref.delete()
        
        # 将用户列表转换为字典并保存
        for index, user in enumerate(users):
            user_key = f"user_{index}"
            users_ref.child(user_key).set(user)
        
        return True
    except Exception as e:
        print(f"保存用户数据失败: {e}")
        return False

def initialize_default_users():
    """初始化默认用户（如果不存在）"""
    current_users = load_users()
    if not current_users:
        default_users = [
            {
                "username": "admin",
                "_password_plaintext_initial": "A123456",
                "role": "admin"
            },
            {
                "username": "user",
                "_password_plaintext_initial": "U123456",
                "role": "user"
            }
        ]
        save_users(default_users)
        print("默认用户已初始化")
    return load_users()

# ===== 数据管理相关函数 =====
def load_data():
    """从Firebase加载链接数据"""
    try:
        data_ref = get_db_ref(DATA_PATH)
        data = data_ref.get()
        
        # 如果数据不存在
        if data is None:
            return {"groups": []}
        
        return data
    except Exception as e:
        print(f"加载链接数据失败: {e}")
        return {"groups": []}

def save_data(data):
    """保存链接数据到Firebase"""
    try:
        data_ref = get_db_ref(DATA_PATH)
        data_ref.set(data)
        return True
    except Exception as e:
        print(f"保存链接数据失败: {e}")
        return False

def initialize_default_data():
    """初始化默认链接数据（如果不存在）"""
    current_data = load_data()
    if not current_data or not current_data.get('groups'):
        default_data = {
            "groups": [
                {
                    "id": "ai-decision",
                    "title": "AI决策",
                    "description": "AI辅助决策相关工具和资源",
                    "order": 1,
                    "links": [
                        {
                            "id": "ai-data-decision",
                            "title": "AI数据决策",
                            "url": "https://ai.cn/aaa1",
                            "description": "基于数据的AI决策分析工具",
                            "order": 1
                        },
                        {
                            "id": "ai-historical-decision",
                            "title": "AI历史决策",
                            "url": "https://ai.cn/aaa2",
                            "description": "历史数据辅助决策系统",
                            "order": 2
                        }
                    ]
                },
                {
                    "id": "ai-advisor",
                    "title": "AI顾问",
                    "description": "AI顾问服务和工具集合",
                    "order": 2,
                    "links": [
                        {
                            "id": "ai-intelligent-advisor",
                            "title": "AI智能顾问",
                            "url": "https://ai.cn/aaa4",
                            "description": "通用型AI顾问服务",
                            "order": 1
                        },
                        {
                            "id": "ai-legal-advisor",
                            "title": "AI法律顾问",
                            "url": "https://ai.cn/aaa5",
                            "description": "法律领域专业AI顾问",
                            "order": 2
                        }
                    ]
                }
            ]
        }
        save_data(default_data)
        print("默认链接数据已初始化")
    return load_data()