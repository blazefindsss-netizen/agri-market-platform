from flask import Blueprint, request, jsonify
from models import PriceHistory

prices_bp = Blueprint('prices', __name__)

@prices_bp.route('/<crop>', methods=['GET'])
def get_prices(crop):
    district = request.args.get('district')
    query = PriceHistory.query.filter_by(crop=crop)
    if district:
        query = query.filter_by(district=district)
    results = query.order_by(PriceHistory.date).all()
    return jsonify([{'date': r.date.isoformat(), 'price': r.price} for r in results])

@prices_bp.route('/<crop>/signal', methods=['GET'])
def get_signal(crop):
    district = request.args.get('district')
    query = PriceHistory.query.filter_by(crop=crop)
    if district:
        query = query.filter_by(district=district)
    results = query.order_by(PriceHistory.date).all()

    if len(results) < 14:
        return jsonify({'signal': 'insufficient data'})

    recent_avg = sum(r.price for r in results[-7:]) / 7
    prior_avg = sum(r.price for r in results[-14:-7]) / 7
    trend = 'rising' if recent_avg > prior_avg else 'falling'

    return jsonify({
        'signal': trend,
        'recommendation': 'Prices are rising — consider waiting a few days before selling' if trend == 'rising' else 'Prices are falling — consider selling soon',
        'recent_avg': round(recent_avg, 2),
        'prior_avg': round(prior_avg, 2)
    })