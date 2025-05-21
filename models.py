from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import os
from dotenv import load_dotenv
import datetime
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 加载环境变量
load_dotenv()

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='user')
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self, exclude_password=True):
        """将用户对象转换为字典，用于API响应"""
        result = {
            'id': self.id,
            'username': self.username,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        if not exclude_password:
            result['password_hash'] = self.password_hash
        return result

class Group(db.Model):
    __tablename__ = 'groups'
    
    id = db.Column(db.String(50), primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    order = db.Column(db.Integer, default=0)
    
    # 一对多关系
    links = db.relationship('Link', backref='group', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        """将组对象转换为字典，包括其关联的链接"""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'order': self.order,
            'links': [link.to_dict() for link in self.links]
        }

class Link(db.Model):
    __tablename__ = 'links'
    
    id = db.Column(db.String(50), primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    url = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    order = db.Column(db.Integer, default=0)
    
    # 外键关系
    group_id = db.Column(db.String(50), db.ForeignKey('groups.id'), nullable=False)
    
    def to_dict(self):
        """将链接对象转换为字典"""
        return {
            'id': self.id,
            'title': self.title,
            'url': self.url,
            'description': self.description,
            'order': self.order
        }

def init_db(app):
    """初始化数据库，自动回退到SQLite如果PostgreSQL连接失败"""
    db.init_app(app)
    
    try:
        logger.info(f"尝试连接数据库: {app.config['SQLALCHEMY_DATABASE_URI']}")
        
        with app.app_context():
            # 尝试连接数据库并创建表
            db.engine.connect()
            logger.info("数据库连接成功，创建表...")
            db.create_all()
            logger.info("数据库表创建成功")
            
    except Exception as e:
        logger.error(f"PostgreSQL数据库操作失败: {str(e)}")
        logger.info("自动回退到SQLite数据库...")
        
        # 修改配置，使用SQLite数据库
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///ailink.db'
        logger.info(f"现在使用SQLite数据库: {app.config['SQLALCHEMY_DATABASE_URI']}")
        
        # 重新初始化数据库连接
        db.init_app(app)
        
        with app.app_context():
            # 重新创建表
            db.create_all()
            logger.info("SQLite数据库表创建成功")
        
def import_data_from_json(app, data_file_path, users_file_path):
    """从JSON文件导入数据到数据库"""
    import json
    
    with app.app_context():
        # 检查数据库是否已有数据
        try:
            if User.query.count() > 0 or Group.query.count() > 0:
                logger.info("数据库已有数据，跳过导入")
                return False  # 数据库已有数据，不导入
        except Exception as e:
            logger.error(f"检查数据库数据时出错: {str(e)}")
            
        # 导入用户数据
        try:
            logger.info(f"从 {users_file_path} 导入用户数据")
            with open(users_file_path, 'r', encoding='utf-8') as f:
                users_data = json.load(f)
                
            for user_data in users_data:
                user = User(
                    username=user_data['username'],
                    password_hash=user_data['password_hash'],
                    role=user_data['role']
                )
                db.session.add(user)
            
            logger.info(f"从 {data_file_path} 导入组和链接数据")
            # 导入分组和链接数据
            with open(data_file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            for group_data in data.get('groups', []):
                group = Group(
                    id=group_data['id'],
                    title=group_data['title'],
                    description=group_data['description'],
                    order=group_data['order']
                )
                db.session.add(group)
                
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
                    
            db.session.commit()
            logger.info("数据导入成功")
            return True
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"导入数据错误: {str(e)}")
            return False 