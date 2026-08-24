from flask import Blueprint, request, jsonify
from extensions import db
from models import Listing

listings_bp = Blueprint('listings', __name__)

@listings_bp.route('', methods=['POST'])
def create_listing():
    data = request.json
    listing = Listing(
        user_id=data['user_id'],
        crop=data['crop'],
        quantity=data['quantity'],
        quality_grade=data.get('quality_grade', 'A'),
        expected_price=data['expected_price'],
        location=data.get('location', '')
    )
    db.session.add(listing)
    db.session.commit()
    return jsonify({'id': listing.id, 'crop': listing.crop, 'status': listing.status})

@listings_bp.route('/<int:user_id>', methods=['GET'])
def get_user_listings(user_id):
    listings = Listing.query.filter_by(user_id=user_id).all()
    return jsonify([{
        'id': l.id, 'crop': l.crop, 'quantity': l.quantity,
        'expected_price': l.expected_price, 'status': l.status
    } for l in listings])