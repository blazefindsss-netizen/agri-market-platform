from flask import Blueprint, jsonify
from models import Listing, Demand

matches_bp = Blueprint('matches', __name__)

@matches_bp.route('/<int:listing_id>', methods=['GET'])
def find_matches(listing_id):
    listing = Listing.query.get(listing_id)
    if not listing:
        return jsonify({'error': 'Listing not found'}), 404

    candidates = Demand.query.filter(
        Demand.crop == listing.crop,
        Demand.price_max >= listing.expected_price * 0.9
    ).all()

    return jsonify([{
        'demand_id': d.id,
        'buyer_id': d.user_id,
        'crop': d.crop,
        'price_range': [d.price_min, d.price_max],
        'quantity_needed': d.quantity_needed,
        'location': d.location
    } for d in candidates])