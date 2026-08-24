from flask import Blueprint, request, jsonify
from extensions import db
from models import Demand

demands_bp = Blueprint('demands', __name__)

@demands_bp.route('', methods=['POST'])
def create_demand():
    data = request.json
    demand = Demand(
        user_id=data['user_id'],
        crop=data['crop'],
        quantity_needed=data['quantity_needed'],
        quality_spec=data.get('quality_spec', 'A'),
        price_min=data['price_min'],
        price_max=data['price_max'],
        location=data.get('location', '')
    )
    db.session.add(demand)
    db.session.commit()
    return jsonify({'id': demand.id, 'crop': demand.crop})

@demands_bp.route('/<int:user_id>', methods=['GET'])
def get_user_demands(user_id):
    demands = Demand.query.filter_by(user_id=user_id).all()
    return jsonify([{
        'id': d.id, 'crop': d.crop, 'quantity_needed': d.quantity_needed,
        'price_min': d.price_min, 'price_max': d.price_max
    } for d in demands])