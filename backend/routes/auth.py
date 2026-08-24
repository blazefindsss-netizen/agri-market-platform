from flask import Blueprint, request, jsonify
import bcrypt, jwt
from extensions import db
from models import User

auth_bp = Blueprint('auth', __name__)
SECRET = 'hackathon-secret-key'

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.json
    existing = User.query.filter_by(phone=data['phone']).first()
    if existing:
        return jsonify({'error': 'This phone number is already registered. Try logging in instead.'}), 400

    hashed = bcrypt.hashpw(data['password'].encode(), bcrypt.gensalt())
    user = User(name=data['name'], phone=data['phone'], password_hash=hashed.decode(),
                role=data['role'], location=data.get('location', ''))
    db.session.add(user)
    db.session.commit()
    token = jwt.encode({'id': user.id}, SECRET, algorithm='HS256')
    return jsonify({'token': token, 'user': {'id': user.id, 'name': user.name, 'role': user.role}})

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(phone=data['phone']).first()
    if not user or not bcrypt.checkpw(data['password'].encode(), user.password_hash.encode()):
        return jsonify({'error': 'Invalid credentials'}), 401
    token = jwt.encode({'id': user.id}, SECRET, algorithm='HS256')
    return jsonify({'token': token, 'user': {'id': user.id, 'name': user.name, 'role': user.role}})