from flask import Blueprint, request, jsonify
from extensions import db
from models import Offer, Match

offers_bp = Blueprint('offers', __name__)

@offers_bp.route('', methods=['POST'])
def create_offer():
    data = request.json
    # Create a Match record first if one doesn't already exist
    match = Match(
        listing_id=data['listing_id'],
        demand_id=data['demand_id'],
        status='pending'
    )
    db.session.add(match)
    db.session.commit()

    offer = Offer(
        match_id=match.id,
        offered_price=data['offered_price']
    )
    db.session.add(offer)
    db.session.commit()

    return jsonify({'id': offer.id, 'match_id': match.id, 'status': offer.status})

@offers_bp.route('/<int:offer_id>/status', methods=['PATCH'])
def update_status(offer_id):
    offer = Offer.query.get(offer_id)
    if not offer:
        return jsonify({'error': 'Offer not found'}), 404
    offer.status = request.json['status']
    db.session.commit()
    return jsonify({'id': offer.id, 'status': offer.status})

@offers_bp.route('/buyer/<int:user_id>', methods=['GET'])
def get_buyer_offers(user_id):
    from models import Demand, Listing
    offers = Offer.query.join(Match).join(Demand, Match.demand_id == Demand.id).filter(Demand.user_id == user_id).all()
    return jsonify([{
        'id': o.id, 'offered_price': o.offered_price, 'status': o.status
    } for o in offers])