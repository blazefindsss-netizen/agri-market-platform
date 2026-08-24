from flask import Blueprint, request, jsonify
from models import PriceHistory, Listing, Demand
from datetime import datetime

chatbot_bp = Blueprint('chatbot', __name__)

CROPS = ['onion', 'tomato', 'cotton']

def get_price_answer(crop, district='Nashik'):
    results = PriceHistory.query.filter_by(crop=crop, district=district).order_by(PriceHistory.date).all()
    if not results:
        return f"Sorry, I don't have price data for {crop} right now."
    latest = results[-1]
    if len(results) >= 14:
        recent_avg = sum(r.price for r in results[-7:]) / 7
        prior_avg = sum(r.price for r in results[-14:-7]) / 7
        trend = "rising" if recent_avg > prior_avg else "falling"
        advice = "you might want to wait a few days" if trend == "rising" else "it may be a good time to sell soon"
        return f"The current price of {crop} in {district} is ₹{latest.price}/quintal. Prices are {trend}, so {advice}."
    return f"The current price of {crop} in {district} is ₹{latest.price}/quintal."

@chatbot_bp.route('', methods=['POST'])
def chat():
    message = request.json.get('message', '').lower().strip()

    if not message:
        return jsonify({'reply': "Please type or say a question."})

    if any(word in message for word in ['hi', 'hello', 'hey', 'namaste']):
        return jsonify({'reply': "Hello! I can help with crop prices, listing your produce, or finding buyers. What would you like to know?"})

    for crop in CROPS:
        if crop in message and any(word in message for word in ['price', 'rate', 'cost', 'kitna', 'bhav']):
            return jsonify({'reply': get_price_answer(crop)})

    if any(word in message for word in ['list', 'sell my', 'how to sell', 'create lot']):
        return jsonify({'reply': "To list your produce: go to the 'Create Lot' page, choose your crop, enter quantity and expected price, add your location, then submit. Your listing will appear to matching buyers automatically."})

    if any(word in message for word in ['buyer', 'match', 'find buyer']):
        return jsonify({'reply': "Once you create a listing, go to the Buyer Marketplace page to see buyers whose demand matches your crop and price. You can send them a direct offer from there."})

    if any(word in message for word in ['offer', 'accept', 'reject', 'status', 'track']):
        return jsonify({'reply': "You can track all your sent offers and their status (accepted/rejected) on the Logistics Tracker page."})

    return jsonify({'reply': "I can help with: crop prices (e.g. 'onion price'), how to list produce, finding buyers, or tracking offers. What would you like to know?"})