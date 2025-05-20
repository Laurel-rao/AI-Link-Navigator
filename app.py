from flask import Flask, request, jsonify, send_from_directory, session, redirect, url_for, Response
import json
import os
from flask_cors import CORS
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash
import random
import string
import base64 # 用于编码验证码
import io # For sending data
# 导入Vercel存储模块代替Firebase存储
from vercel_storage import load_users, save_users, load_data, save_data, initialize_default_data

app = Flask(__name__, static_folder='./')
# 为Vercel使用固定的密钥 - 在生产环境中应该使用环境变量存储
app.secret_key = 'ai-navigator-secret-key-for-vercel'  
CORS(app)

# 在Vercel上使用的文件路径 - 仅用于本地备份
DATA_FILE = 'data.json'
USERS_FILE = 'users.json'

# --- CAPTCHA Generation ---
def generate_captcha_image(text_length=5):
    """生成简单的文本验证码，返回验证码文本和HTML/CSS格式的验证码"""
    # 生成随机验证码文本
    text = ''.join(random.choices(string.ascii_uppercase + string.digits, k=text_length))
    app.logger.info(f"生成纯文本验证码: {text}")
    
    # 创建简单的HTML格式验证码
    captcha_html = f"""
    <div style="
        display: inline-block; 
        padding: 10px 15px; 
        background: linear-gradient(145deg, #e6e6e6, #f0f0f0); 
        border-radius: 8px; 
        font-family: monospace; 
        font-size: 20px; 
        font-weight: bold; 
        letter-spacing: 5px; 
        color: #333; 
        text-shadow: 1px 1px 1px rgba(255,255,255,0.8); 
        box-shadow: inset 2px 2px 5px rgba(0,0,0,0.1);
        transform: skew({random.randint(-10, 10)}deg);
    ">
        {text}
    </div>
    """
    
    # 使用base64编码HTML以便传输
    captcha_data = base64.b64encode(captcha_html.encode('utf-8')).decode('utf-8')
    
    # 返回验证码文本和HTML格式的验证码（作为字符串）
    return text, captcha_data

# --- Decorators ---
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'logged_in' not in session:
            # Store the original URL they were trying to access in the session
            # So we can redirect them back after login
            return redirect(url_for('serve_login_page', next=request.url))
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'logged_in' not in session:
            return redirect(url_for('serve_login_page', next=request.url))
        if session.get('role') != 'admin':
            # Forbidden - redirect to index or show an error page
            return redirect(url_for('serve_index')) 
        return f(*args, **kwargs)
    return decorated_function

# --- Routes ---

@app.route('/login.html')
def serve_login_page():
    if session.get('logged_in'):
        # If already logged in, redirect to the 'next' URL if provided, or to index
        next_url = request.args.get('next') or url_for('serve_index')
        return redirect(next_url)
    # No need to pre-generate captcha here, client will request image via API
    return send_from_directory(app.static_folder, 'login.html')

@app.route('/api/captcha-image')
def serve_captcha_image():
    captcha_text, captcha_html = generate_captcha_image()
    session['captcha_answer'] = captcha_text
    app.logger.info(f"Generated CAPTCHA: {captcha_text}") # Log for debugging
    return jsonify({
        'captcha_html': captcha_html,  # base64编码的HTML验证码
        'type': 'html'                 # 指示前端这是HTML格式而非图片
    })

@app.route('/api/login', methods=['POST'])
def handle_login_api():
    req_data = request.json
    username = req_data.get('username')
    password = req_data.get('password')
    user_captcha_input = req_data.get('captcha')

    if session.get('require_captcha'):
        correct_captcha = session.get('captcha_answer', '')
        if not user_captcha_input or user_captcha_input.upper() != correct_captcha.upper():
            session['captcha_answer'] = generate_captcha_image()[0] # Generate new text, store for next try
            return jsonify({
                'success': False, 
                'message': '验证码错误，请重试。', 
                'require_captcha': True, 
                # 'captcha_text' removed, client will refresh image
            }), 400 

    users = load_users()
    user_data = next((u for u in users if u["username"] == username), None)

    if user_data and check_password_hash(user_data.get("password_hash", ""), password):
        session['logged_in'] = True
        session['username'] = username
        session['role'] = user_data['role']
        session.pop('require_captcha', None)
        session.pop('captcha_answer', None)
        session.pop('failed_login_attempts', None) # Clear attempts on success
        # Get the 'next' URL from the form submission (if login page passed it) or from query param
        next_url = request.args.get('next') or url_for('serve_index')
        return jsonify({'success': True, 'message': '登录成功！', 'redirect_url': next_url})
    else:
        # Login failed
        failed_attempts = session.get('failed_login_attempts', 0) + 1
        session['failed_login_attempts'] = failed_attempts
        
        session['require_captcha'] = True # Always require captcha after any failure for simplicity now
        # Generate new captcha text and store it, image will be fetched by client
        session['captcha_answer'] = generate_captcha_image()[0] 
        return jsonify({
            'success': False, 
            'message': '无效的账号或密码。' if failed_attempts <= 1 else '无效的账号或密码。请输入验证码。', 
            'require_captcha': True, 
        }), 401

@app.route('/api/user-info')
@login_required
def get_user_info():
    return jsonify({
        'success': True,
        'username': session.get('username'),
        'role': session.get('role')
    })

@app.route('/logout')
def handle_logout():
    session.clear()
    return redirect(url_for('serve_login_page'))

@app.route('/')
@login_required
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/admin.html')
@admin_required # Now requires admin role
def serve_admin_page():
    return send_from_directory(app.static_folder, 'admin.html')

@app.route('/data.json')
@login_required # All logged-in users can fetch data.json for display
def serve_data_file():
    # 从Vercel Edge Config获取数据并动态生成响应
    data = load_data()
    return jsonify(data)

@app.route('/api/save-data', methods=['POST'])
@admin_required # Only admins can save data
def save_data_api():
    try:
        content = request.json
        if not content or 'groups' not in content or not isinstance(content['groups'], list):
            return jsonify({'error': '无效的数据格式'}), 400
        
        # 将数据保存到Vercel Edge Config
        success = save_data(content)
        if success:
            return jsonify({'success': True, 'message': '数据已保存到Vercel Edge Config'})
        else:
            return jsonify({'error': '保存数据失败，请检查Vercel Edge Config设置'}), 500
    except Exception as e:
        app.logger.error(f"Error saving data: {e}")
        return jsonify({'error': str(e)}), 500

# --- User Management APIs (Admin only) ---
@app.route('/api/users', methods=['GET'])
@admin_required
def get_all_users():
    users = load_users()
    # Return users without password hashes for security in list view
    users_to_send = [{k: v for k, v in u.items() if k != 'password_hash' and not k.startswith('_password')} for u in users]
    return jsonify(users_to_send)

@app.route('/api/users', methods=['POST'])
@admin_required
def create_user_api():
    req_data = request.json
    username = req_data.get('username')
    password = req_data.get('password')
    role = req_data.get('role', 'user') # Default to 'user' role

    if not username or not password:
        return jsonify({'success': False, 'message': '用户名和密码不能为空。'}), 400
    if role not in ['admin', 'user']:
        return jsonify({'success': False, 'message': '无效的用户角色。'}), 400

    users = load_users()
    if any(u['username'] == username for u in users):
        return jsonify({'success': False, 'message': '用户名已存在。'}), 409 # Conflict

    new_user = {
        "username": username,
        "password_hash": generate_password_hash(password),
        "role": role
    }
    users.append(new_user)
    save_users(users)
    # Don't send password hash back
    return jsonify({'success': True, 'message': '用户创建成功！', 'user': {"username": username, "role": role}}), 201

@app.route('/api/users/<string:username_to_edit>', methods=['PUT'])
@admin_required
def update_user_api(username_to_edit):
    req_data = request.json
    new_password = req_data.get('password') # Optional: for password change
    new_role = req_data.get('role') # Optional: for role change

    users = load_users()
    user_to_update = None
    user_index = -1
    for i, u in enumerate(users):
        if u['username'] == username_to_edit:
            user_to_update = u
            user_index = i
            break
    
    if not user_to_update:
        return jsonify({'success': False, 'message': '用户未找到。'}), 404

    updated = False
    if new_password:
        user_to_update['password_hash'] = generate_password_hash(new_password)
        updated = True
    if new_role and new_role in ['admin', 'user']:
        user_to_update['role'] = new_role
        updated = True
    
    if updated:
        users[user_index] = user_to_update
        save_users(users)
        return jsonify({'success': True, 'message': f'用户 {username_to_edit} 更新成功。'})
    else:
        return jsonify({'success': False, 'message': '未提供有效更新信息。'}), 400

@app.route('/api/users/<string:username_to_delete>', methods=['DELETE'])
@admin_required
def delete_user_api(username_to_delete):
    if username_to_delete == session.get('username'):
        return jsonify({'success': False, 'message': '不能删除当前登录的管理员账户。'}), 403
    if username_to_delete == "admin" and len([u for u in load_users() if u['role'] == 'admin']) <=1:
        # Prevent deleting the last admin
         return jsonify({'success': False, 'message': '不能删除唯一的管理员账户。'}), 403

    users = load_users()
    original_length = len(users)
    users = [u for u in users if u['username'] != username_to_delete]

    if len(users) < original_length:
        save_users(users)
        return jsonify({'success': True, 'message': f'用户 {username_to_delete} 已删除。'})
    else:
        return jsonify({'success': False, 'message': '用户未找到。'}), 404

# Flask will automatically serve other static files from the 'static_folder' (root in this case)
# if no specific route matches. login.html's CSS/JS (if any not from CDN) will be served this way.

# 在Vercel上运行时使用这个初始化
initialize_default_data()

# 本地开发服务器
if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=8000)