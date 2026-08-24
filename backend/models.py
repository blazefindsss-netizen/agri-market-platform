from extensions import db
from datetime import datetime

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    phone = db.Column(db.String(15), unique=True)
    password_hash = db.Column(db.String(200))
    role = db.Column(db.String(10))
    location = db.Column(db.String(100))
    verified = db.Column(db.Boolean, default=False)

class Listing(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    crop = db.Column(db.String(50))
    quantity = db.Column(db.Float)
    quality_grade = db.Column(db.String(20))
    expected_price = db.Column(db.Float)
    location = db.Column(db.String(100))
    status = db.Column(db.String(20), default='open')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Demand(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    crop = db.Column(db.String(50))
    quantity_needed = db.Column(db.Float)
    quality_spec = db.Column(db.String(20))
    price_min = db.Column(db.Float)
    price_max = db.Column(db.Float)
    location = db.Column(db.String(100))

class Match(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    listing_id = db.Column(db.Integer, db.ForeignKey('listing.id'))
    demand_id = db.Column(db.Integer, db.ForeignKey('demand.id'))
    status = db.Column(db.String(20), default='pending')

class Offer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    match_id = db.Column(db.Integer, db.ForeignKey('match.id'))
    offered_price = db.Column(db.Float)
    status = db.Column(db.String(20), default='offered')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class PriceHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    crop = db.Column(db.String(50))
    market_name = db.Column(db.String(100))
    district = db.Column(db.String(50))
    price = db.Column(db.Float)
    date = db.Column(db.Date)