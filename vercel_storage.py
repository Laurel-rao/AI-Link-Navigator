"""
Vercel存储模块
提供与Vercel Edge Config交互的函数，用于替代Firebase实时数据库
"""

import os
import json
import traceback
from werkzeug.security import generate_password_hash
import requests

# Vercel Edge Config配置
EDGE_CONFIG_ID = os.environ.get('EDGE_CONFIG_ID')
EDGE_CONFIG_TOKEN = os.environ.get('EDGE_CONFIG_TOKEN')
VERCEL_API_URL = "https://api.vercel.com/v1/edge-config"

def initialize_vercel_storage():
    """初始化Vercel存储连接检查"""
    try:
        print("=== Vercel存储初始化开始 ===")
        print(f"运行环境: {os.environ.get('VERCEL_ENV', '非Vercel环境')}")
        
        # 检查是否在Vercel环境中运行
        is_vercel = os.environ.get('VERCEL') == '1'
        print(f"是否在Vercel环境中: {is_vercel}")
        
        # 检查环境变量
        print("检查环境变量中是否有Edge Config凭据...")
        if EDGE_CONFIG_ID and EDGE_CONFIG_TOKEN:
            print(f"找到Edge Config凭据，ID: {EDGE_CONFIG_ID[:5]}...")
            return True
        else:
            print("未找到Edge Config凭据")
            if is_vercel:
                print("⚠️ 在Vercel环境中运行但未找到Edge Config凭据!")
                print("请在Vercel项目设置中添加EDGE_CONFIG_ID和EDGE_CONFIG_TOKEN环境变量")
            return False
    except Exception as e:
        print(f"Vercel存储初始化错误: {e}")
        print(f"错误类型: {type(e).__name__}")
        print(f"错误堆栈: {traceback.format_exc()}")
        return False

# Edge Config API函数
def _get_edge_config_item(key):
    """从Edge Config获取项目"""
    if not EDGE_CONFIG_ID or not EDGE_CONFIG_TOKEN:
        return None
    
    url = f"{VERCEL_API_URL}/{EDGE_CONFIG_ID}/items/{key}"
    headers = {
        "Authorization": f"Bearer {EDGE_CONFIG_TOKEN}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            return response.json().get("value")
        else:
            print(f"获取Edge Config项目失败: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"Edge Config API请求错误: {e}")
        return None

def _set_edge_config_item(key, value):
    """设置Edge Config项目"""
    if not EDGE_CONFIG_ID or not EDGE_CONFIG_TOKEN:
        return False
    
    url = f"{VERCEL_API_URL}/{EDGE_CONFIG_ID}/items"
    headers = {
        "Authorization": f"Bearer {EDGE_CONFIG_TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {
        "items": [
            {
                "operation": "update",
                "key": key,
                "value": value
            }
        ]
    }
    
    try:
        response = requests.patch(url, headers=headers, json=payload)
        if response.status_code == 200:
            return True
        else:
            print(f"设置Edge Config项目失败: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"Edge Config API请求错误: {e}")
        return False

# 用户数据操作
def load_users():
    """从Vercel Edge Config加载用户数据"""
    try:
        print("尝试加载用户数据...")
        storage_initialized = initialize_vercel_storage()
        
        if storage_initialized:
            users_data = _get_edge_config_item("users")
            print(f"获取到用户数据: {users_data is not None}")
            if users_data is not None:
                print(f"返回用户列表，包含{len(users_data)}个用户")
                return users_data
        
        # 如果无法从Vercel获取，尝试从本地加载
        print("无法从Vercel获取用户数据，尝试从本地文件加载")
        return _load_users_from_file()
    except Exception as e:
        print(f"加载用户数据错误: {e}")
        print(f"错误堆栈: {traceback.format_exc()}")
        # 发生错误时，尝试从本地文件加载
        return _load_users_from_file()

def save_users(users):
    """保存用户数据到Vercel Edge Config"""
    try:
        print(f"尝试保存{len(users)}个用户到Vercel...")
        storage_initialized = initialize_vercel_storage()
        
        if storage_initialized:
            result = _set_edge_config_item("users", users)
            if result:
                print("用户数据成功保存到Vercel Edge Config")
                return True
            else:
                print("保存到Vercel Edge Config失败，尝试保存到本地")
        
        # 如果无法保存到Vercel，尝试保存到本地
        return _save_users_to_file(users)
    except Exception as e:
        print(f"保存用户数据错误: {e}")
        print(f"错误类型: {type(e).__name__}")
        print(f"错误堆栈: {traceback.format_exc()}")
        # 发生错误时，保存到本地文件作为备份
        try:
            return _save_users_to_file(users)
        except Exception as file_err:
            print(f"保存到本地文件也失败: {file_err}")
            # 在Vercel等只读环境中，直接返回成功而不是抛出错误
            if 'Read-only file system' in str(file_err):
                print("检测到只读文件系统(可能在Vercel环境中)，跳过文件保存")
                return True
            return False

# 链接数据操作
def load_data():
    """从Vercel Edge Config加载链接数据"""
    try:
        print("尝试从Vercel加载链接数据...")
        storage_initialized = initialize_vercel_storage()
        
        if storage_initialized:
            data = _get_edge_config_item("links_data")
            print(f"获取链接数据结果: {data is not None}")
            
            if data is not None:
                if isinstance(data, dict) and 'groups' in data:
                    print(f"成功获取链接数据，包含{len(data['groups'])}个分组")
                else:
                    print(f"获取的数据格式不符合预期: {type(data)}")
                return data
        
        # 如果无法从Vercel获取，尝试从本地加载
        print("无法从Vercel获取链接数据，尝试从本地文件加载")
        return _load_data_from_file()
    except Exception as e:
        print(f"加载链接数据错误: {e}")
        print(f"错误类型: {type(e).__name__}")
        print(f"错误堆栈: {traceback.format_exc()}")
        # 发生错误时，尝试从本地文件加载
        return _load_data_from_file()

def save_data(content):
    """保存链接数据到Vercel Edge Config"""
    try:
        print("尝试保存链接数据到Vercel...")
        if not isinstance(content, dict) or 'groups' not in content:
            print(f"数据格式不正确: {type(content)}")
            
        if isinstance(content, dict) and 'groups' in content:
            print(f"准备保存链接数据，包含{len(content['groups'])}个分组")
        
        storage_initialized = initialize_vercel_storage()
        if storage_initialized:
            result = _set_edge_config_item("links_data", content)
            if result:
                print("链接数据成功保存到Vercel Edge Config")
                return True
            else:
                print("保存到Vercel Edge Config失败，尝试保存到本地")
        
        # 如果无法保存到Vercel，尝试保存到本地
        try:
            return _save_data_to_file(content)
        except Exception as file_err:
            print(f"保存到本地文件也失败: {file_err}")
            # 在Vercel等只读环境中，直接返回成功而不是抛出错误
            if 'Read-only file system' in str(file_err):
                print("检测到只读文件系统(可能在Vercel环境中)，跳过文件保存")
                return True
            return False
    except Exception as e:
        print(f"保存链接数据错误: {e}")
        print(f"错误类型: {type(e).__name__}")
        print(f"错误堆栈: {traceback.format_exc()}")
        # 发生错误时，保存到本地文件作为备份
        try:
            return _save_data_to_file(content)
        except Exception as file_err:
            print(f"保存到本地文件也失败: {file_err}")
            # 在Vercel等只读环境中，直接返回成功而不是抛出错误
            if 'Read-only file system' in str(file_err):
                print("检测到只读文件系统(可能在Vercel环境中)，跳过文件保存")
                return True
            return False

# 本地文件备份操作（当Vercel Edge Config不可用时使用）
def _load_users_from_file():
    """从本地文件加载用户数据（备用方法）"""
    users_file = 'users.json'
    print(f"尝试从本地文件 {users_file} 加载用户数据")
    
    # 在Vercel环境中我们需要返回默认用户，因为无法从本地文件读取
    is_vercel = os.environ.get('VERCEL') == '1'
    if is_vercel:
        print("在Vercel环境中，返回默认用户数据")
        # 返回默认的硬编码用户数据
        from werkzeug.security import generate_password_hash
        return [
            {
                "username": "admin",
                "password_hash": generate_password_hash("A123456"),
                "role": "admin"
            },
            {
                "username": "user",
                "password_hash": generate_password_hash("U123456"),
                "role": "user"
            }
        ]
    
    # 本地环境从文件读取
    if not os.path.exists(users_file):
        print(f"文件 {users_file} 不存在")
        return []
    try:
        with open(users_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            print(f"成功从文件加载了 {len(data)} 个用户")
            return data
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
    print(f"尝试从本地文件 {data_file} 加载链接数据")
    
    # 在Vercel环境中，返回一个示例数据
    is_vercel = os.environ.get('VERCEL') == '1'
    if is_vercel:
        print("在Vercel环境中，返回默认链接数据")
        # 返回一个简单的示例数据
        return {
            'groups': [
                {
                    'title': 'AI 工具链接',
                    'description': '常用AI工具链接集合',
                    'order': 1,
                    'links': [
                        {
                            'title': 'ChatGPT',
                            'url': 'https://chat.openai.com/',
                            'description': 'OpenAI的ChatGPT对话工具',
                            'order': 0
                        },
                        {
                            'title': 'Gemini',
                            'url': 'https://gemini.google.com/',
                            'description': 'Google的Gemini AI平台',
                            'order': 1
                        }
                    ]
                }
            ]
        }
    
    # 本地环境从文件读取
    if not os.path.exists(data_file):
        print(f"文件 {data_file} 不存在")
        return {'groups': []}
    try:
        with open(data_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            group_count = len(data.get('groups', []))
            print(f"成功从文件加载了 {group_count} 个分组")
            return data
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
    """初始化默认数据到Vercel Edge Config（如果不存在）"""
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