from flask import Flask, request, jsonify, send_from_directory, session, redirect, url_for, Response
import json
import os
from flask_cors import CORS
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash
import random
import string
from PIL import Image, ImageDraw, ImageFont # Pillow for image generation
import io # For sending image data

app = Flask(__name__, static_folder='./')
app.secret_key = os.urandom(24)  # Needed for Flask sessions
CORS(app)

DATA_FILE = os.path.join(app.root_path, 'data.json')
USERS_FILE = os.path.join(app.root_path, 'users.json')

# --- CAPTCHA Generation ---
def generate_captcha_image(text_length=5):
    text = ''.join(random.choices(string.ascii_uppercase + string.digits, k=text_length))

    font = ImageFont.load_default()
    font_size = 8
    image_width = text_length * (font_size // 2 + 10) # Approximate width
    image_height = font_size + 20
    image = Image.new('RGB', (image_width, image_height), color = (220, 220, 220)) # Light grey background
    draw = ImageDraw.Draw(image)

    # Draw text
    text_bbox = draw.textbbox((0,0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    text_x = (image_width - text_width) // 2
    text_y = (image_height - text_height) // 2 - 5 # Slight adjustment
    draw.text((text_x, text_y), text, font=font, fill=(50, 50, 50)) # Dark grey text

    # Add some noise (lines and points)
    for _ in range(random.randint(3, 6)): # Number of lines
        x1 = random.randint(0, image_width)
        y1 = random.randint(0, image_height)
        x2 = random.randint(0, image_width)
        y2 = random.randint(0, image_height)
        draw.line(((x1, y1), (x2, y2)), fill=(random.randint(100,200), random.randint(100,200), random.randint(100,200)), width=1)
    
    for _ in range(random.randint(50, 100)): # Number of points
        x = random.randint(0, image_width)
        y = random.randint(0, image_height)
        draw.point((x,y), fill=(random.randint(120,180), random.randint(120,180), random.randint(120,180)))

    img_byte_arr = io.BytesIO()
    image.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)
    return text, img_byte_arr

# --- User Data Management ---
def load_users():
    if not os.path.exists(USERS_FILE):
        return []
    try:
        with open(USERS_FILE, 'r', encoding='utf-8') as f:
            users = json.load(f)
        # Initial password hashing if plaintext is present
        updated = False
        for user_data in users:
            if "_password_plaintext_initial" in user_data and user_data["_password_plaintext_initial"]:
                user_data["password_hash"] = generate_password_hash(user_data["_password_plaintext_initial"])
                del user_data["_password_plaintext_initial"]
                updated = True
        if updated:
            save_users(users) # Save back with hashed passwords
        return users
    except (IOError, json.JSONDecodeError) as e:
        app.logger.error(f"Error loading users.json: {e}")
        return []

def save_users(users):
    try:
        with open(USERS_FILE, 'w', encoding='utf-8') as f:
            json.dump(users, f, ensure_ascii=False, indent=2)
    except IOError as e:
        app.logger.error(f"Error saving users.json: {e}")

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
    captcha_text, image_data = generate_captcha_image()
    session['captcha_answer'] = captcha_text
    app.logger.info(f"Generated CAPTCHA: {captcha_text}") # Log for debugging
    return Response(image_data, mimetype='image/png')

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
def root():
    if session.get('logged_in'):
        return redirect(url_for('serve_index'))
    else:
        return redirect(url_for('serve_login_page'))

@app.route('/index.html')
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
    return send_from_directory(app.static_folder, 'data.json')

@app.route('/api/save-data', methods=['POST'])
@admin_required # Only admins can save data
def save_data_api():
    if not request.is_json:
        return jsonify({'success': False, 'message': '无效的请求格式，需要JSON'}), 400
    
    data_to_save = request.json
    
    try:
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(data_to_save, f, ensure_ascii=False, indent=2)
        return jsonify({'success': True, 'message': '数据保存成功'})
    except Exception as e:
        app.logger.error(f"Error saving data: {e}")
        return jsonify({'success': False, 'message': f'保存数据时出错: {str(e)}'}), 500

# --- User Management API ---

@app.route('/api/users', methods=['GET'])
@admin_required
def get_all_users():
    users = load_users()
    safe_users = [{k: v for k, v in user.items() if k != 'password_hash'} for user in users] # Remove password hashes
    return jsonify({'success': True, 'users': safe_users})

@app.route('/api/users', methods=['POST'])
@admin_required
def create_user_api():
    req_data = request.json
    username = req_data.get('username')
    password = req_data.get('password')
    role = req_data.get('role', 'user')  # Default to 'user' role if not specified
    
    if not username or not password:
        return jsonify({'success': False, 'message': '用户名和密码不能为空'}), 400
    
    # Validate role
    if role not in ['admin', 'user']:
        return jsonify({'success': False, 'message': '无效的角色，必须是 "admin" 或 "user"'}), 400
    
    users = load_users()
    
    # Check if username already exists
    if any(u['username'] == username for u in users):
        return jsonify({'success': False, 'message': f'用户名 "{username}" 已存在'}), 400
    
    # Create new user
    new_user = {
        'username': username,
        'password_hash': generate_password_hash(password),
        'role': role
    }
    
    users.append(new_user)
    save_users(users)
    
    return jsonify({
        'success': True, 
        'message': f'用户 "{username}" 创建成功', 
        'user': {'username': username, 'role': role}
    })

@app.route('/api/users/<string:username_to_edit>', methods=['PUT'])
@admin_required
def update_user_api(username_to_edit):
    # This is a simplified example; in production you'd have more validation and error handling
    req_data = request.json
    new_password = req_data.get('password')
    new_role = req_data.get('role')
    
    users = load_users()
    user_index = None
    
    # Find the user index
    for i, user in enumerate(users):
        if user['username'] == username_to_edit:
            user_index = i
            break
    
    if user_index is None:
        return jsonify({'success': False, 'message': f'用户 "{username_to_edit}" 不存在'}), 404
    
    # Check if trying to downgrade the last admin
    if users[user_index]['role'] == 'admin' and new_role == 'user':
        admin_count = sum(1 for u in users if u['role'] == 'admin')
        if admin_count <= 1:
            return jsonify({'success': False, 'message': '无法降级唯一的管理员账号'}), 400
    
    # Check if trying to modify the current user's role
    if username_to_edit == session.get('username') and new_role == 'user' and users[user_index]['role'] == 'admin':
        return jsonify({'success': False, 'message': '无法降级当前登录的管理员账号'}), 400
    
    # Update user data
    if new_password:
        users[user_index]['password_hash'] = generate_password_hash(new_password)
    
    if new_role and new_role in ['admin', 'user']:
        users[user_index]['role'] = new_role
    
    save_users(users)
    
    return jsonify({
        'success': True, 
        'message': f'用户 "{username_to_edit}" 更新成功',
        'user': {'username': username_to_edit, 'role': users[user_index]['role']}
    })

@app.route('/api/users/<string:username_to_delete>', methods=['DELETE'])
@admin_required
def delete_user_api(username_to_delete):
    users = load_users()
    user_to_delete = None
    
    # Find the user
    for user in users:
        if user['username'] == username_to_delete:
            user_to_delete = user
            break
    
    if not user_to_delete:
        return jsonify({'success': False, 'message': f'用户 "{username_to_delete}" 不存在'}), 404
    
    # Cannot delete the current user
    if username_to_delete == session.get('username'):
        return jsonify({'success': False, 'message': '无法删除当前登录的用户'}), 400
    
    # Check if trying to delete the last admin
    if user_to_delete['role'] == 'admin':
        admin_count = sum(1 for u in users if u['role'] == 'admin')
        if admin_count <= 1:
            return jsonify({'success': False, 'message': '无法删除唯一的管理员账号'}), 400
    
    # Remove the user
    users = [u for u in users if u['username'] != username_to_delete]
    save_users(users)
    
    return jsonify({'success': True, 'message': f'用户 "{username_to_delete}" 已删除'})

# Initialize default users if users.json is empty or doesn't exist
def initialize_default_users():
    try:
        if not os.path.exists(USERS_FILE) or os.path.getsize(USERS_FILE) == 0:
            app.logger.info('Initializing default users in users.json')
            default_users = [
                {
                    'username': 'admin',
                    '_password_plaintext_initial': 'A123456',  # This will be hashed on first load
                    'role': 'admin'
                },
                {
                    'username': 'user',
                    '_password_plaintext_initial': 'U123456',  # This will be hashed on first load
                    'role': 'user'
                }
            ]
            with open(USERS_FILE, 'w', encoding='utf-8') as f:
                json.dump(default_users, f, ensure_ascii=False, indent=2)
            app.logger.info('Default users created successfully')
    except Exception as e:
        app.logger.error(f'Error initializing users.json: {e}')

# Ensure users.json exists with default users before the first request
@app.before_first_request
def before_first_request():
    initialize_default_users()
    # Load users immediately to hash any plaintext passwords
    load_users()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
