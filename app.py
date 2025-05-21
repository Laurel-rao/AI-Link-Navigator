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
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from models import db, User, Group, Link, init_db, import_data_from_json

# 根据环境变量加载不同的 .env 文件
ENV = os.environ.get("FLASK_ENV", "testing")
print(f"当前环境: {ENV}")

# 加载对应环境的配置文件
if ENV == "production":
    print("加载生产环境配置...")
    load_dotenv(".env.production", override=True)
elif ENV == "testing":
    print("加载测试环境配置...")
    load_dotenv(".env.testing", override=True)
else:
    print("加载开发环境配置...")
    load_dotenv(".env.development", override=True)

print("DATABASE_URL: ", os.environ.get('DATABASE_URL'))
print("SECRET_KEY: ", os.environ.get('SECRET_KEY'))
print("DEBUG: ", os.environ.get('DEBUG'))

app = Flask(__name__, static_folder='./')
app.secret_key = os.environ.get('SECRET_KEY', os.urandom(24))
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/ailinkdb')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['DEBUG'] = os.environ.get('DEBUG', 'False').lower() == 'true'

CORS(app)

# 初始化数据库
init_db(app)

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

    # 使用数据库查询用户
    user = User.query.filter_by(username=username).first()

    if user and user.check_password(password):
        session['logged_in'] = True
        session['username'] = username
        session['role'] = user.role
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

@app.route('/api/data')
@login_required # All logged-in users can fetch data for display
def get_data_api():
    try:
        # 从数据库获取所有组及其关联的链接
        groups = Group.query.order_by(Group.order).all()
        data = {
            'groups': [group.to_dict() for group in groups]
        }
        return jsonify(data)
    except Exception as e:
        app.logger.error(f"Error fetching data: {e}")
        return jsonify({'success': False, 'message': f'获取数据时出错: {str(e)}'}), 500

@app.route('/api/save-data', methods=['POST'])
@admin_required # Only admins can save data
def save_data_api():
    if not request.is_json:
        return jsonify({'success': False, 'message': '无效的请求格式，需要JSON'}), 400
    
    data_to_save = request.json
    
    try:
        # 开始事务
        db.session.begin()
        
        # 先删除所有链接，然后再删除所有组，避免外键约束错误
        Link.query.delete()
        db.session.flush()
        
        # 删除所有现有组
        Group.query.delete()
        db.session.flush()
        
        # 添加新组和链接
        for group_data in data_to_save.get('groups', []):
            group = Group(
                id=group_data['id'],
                title=group_data['title'],
                description=group_data['description'],
                order=group_data['order']
            )
            db.session.add(group)
            db.session.flush()  # 确保组ID可用
            
            # 添加组下的链接
            for link_data in group_data.get('links', []):
                link = Link(
                    id=link_data['id'],
                    title=link_data['title'],
                    url=link_data['url'],
                    description=link_data['description'],
                    order=link_data['order'],
                    group_id=group.id
                )
                db.session.add(link)
        
        # 提交事务
        db.session.commit()
        return jsonify({'success': True, 'message': '数据保存成功'})
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error saving data: {e}")
        return jsonify({'success': False, 'message': f'保存数据时出错: {str(e)}'}), 500

# --- User Management API ---

@app.route('/api/users', methods=['GET'])
@admin_required
def get_all_users():
    try:
        users = User.query.all()
        safe_users = [user.to_dict() for user in users]  # 默认排除密码哈希
        return jsonify({'success': True, 'users': safe_users})
    except Exception as e:
        app.logger.error(f"Error getting users: {e}")
        return jsonify({'success': False, 'message': f'获取用户列表时出错: {str(e)}'}), 500

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
    
    # 检查用户名是否已存在
    if User.query.filter_by(username=username).first():
        return jsonify({'success': False, 'message': f'用户名 "{username}" 已存在'}), 400
    
    try:
        # 创建新用户
        new_user = User(username=username, role=role)
        new_user.set_password(password)
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({
            'success': True, 
            'message': f'用户 "{username}" 创建成功', 
            'user': new_user.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error creating user: {e}")
        return jsonify({'success': False, 'message': f'创建用户时出错: {str(e)}'}), 500

@app.route('/api/users/<string:username_to_edit>', methods=['PUT'])
@admin_required
def update_user_api(username_to_edit):
    req_data = request.json
    new_password = req_data.get('password')
    new_role = req_data.get('role')
    
    # 查找用户
    user_to_edit = User.query.filter_by(username=username_to_edit).first()
    
    if not user_to_edit:
        return jsonify({'success': False, 'message': f'用户 "{username_to_edit}" 不存在'}), 404
    
    try:
        # 检查是否尝试降级最后一个管理员
        if user_to_edit.role == 'admin' and new_role == 'user':
            admin_count = User.query.filter_by(role='admin').count()
            if admin_count <= 1:
                return jsonify({'success': False, 'message': '无法降级唯一的管理员账号'}), 400
        
        # 检查是否尝试修改当前用户的角色
        if username_to_edit == session.get('username') and new_role == 'user' and user_to_edit.role == 'admin':
            return jsonify({'success': False, 'message': '无法降级当前登录的管理员账号'}), 400
        
        # 更新用户数据
        if new_password:
            user_to_edit.set_password(new_password)
        
        if new_role and new_role in ['admin', 'user']:
            user_to_edit.role = new_role
        
        db.session.commit()
        
        return jsonify({
            'success': True, 
            'message': f'用户 "{username_to_edit}" 更新成功',
            'user': user_to_edit.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error updating user: {e}")
        return jsonify({'success': False, 'message': f'更新用户时出错: {str(e)}'}), 500

@app.route('/api/users/<string:username_to_delete>', methods=['DELETE'])
@admin_required
def delete_user_api(username_to_delete):
    # 查找用户
    user_to_delete = User.query.filter_by(username=username_to_delete).first()
    
    if not user_to_delete:
        return jsonify({'success': False, 'message': f'用户 "{username_to_delete}" 不存在'}), 404
    
    # 无法删除当前用户
    if username_to_delete == session.get('username'):
        return jsonify({'success': False, 'message': '无法删除当前登录的用户'}), 400
    
    try:
        # 检查是否尝试删除最后一个管理员
        if user_to_delete.role == 'admin':
            admin_count = User.query.filter_by(role='admin').count()
            if admin_count <= 1:
                return jsonify({'success': False, 'message': '无法删除唯一的管理员账号'}), 400
        
        # 删除用户
        db.session.delete(user_to_delete)
        db.session.commit()
        
        return jsonify({'success': True, 'message': f'用户 "{username_to_delete}" 已删除'})
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error deleting user: {e}")
        return jsonify({'success': False, 'message': f'删除用户时出错: {str(e)}'}), 500

# 确保数据库和表已创建，并导入初始数据
@app.before_first_request
def before_first_request():
    # 导入初始数据（仅当数据库为空时）
    import_data_from_json(app, DATA_FILE, USERS_FILE)

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5555)
