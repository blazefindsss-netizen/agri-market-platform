"""
seed_demo_data.py
------------------
Populates the AgriHarvest database with realistic demo data:
- 10 farmer users
- 6 buyer users
- ~14 listings (varied crop/quantity/quality/price)
- ~10 demands (overlapping with listings so matching logic finds results)
- A handful of Match + Offer records in different states (pending/accepted/rejected)

USAGE:
  Place this file in backend/seed_data/seed_demo_data.py (same folder as seed_prices.py)
  Then run from inside backend/ with the venv activated:
      python seed_data/seed_demo_data.py

NOTE ON PASSWORD HASHING:
  This script uses bcrypt.hashpw directly (matches "PyJWT + bcrypt" from the handoff doc).
  If your auth.py instead uses flask_bcrypt's Bcrypt().generate_password_hash(), the hash
  format is different (it returns bytes that need .decode('utf-8'), and check_password_hash
  is called differently). If seeded users can't log in, check auth.py's hashing call and
  tell Claude — the fix is a one-line change to how PASSWORD_HASH is generated below.

All seeded users share the password: demo123
"""

import sys
import os
import bcrypt
from datetime import datetime, timedelta, date

# Allow running this script from backend/seed_data/ while importing from backend/
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app import app
from extensions import db
from models import User, Listing, Demand, Match, Offer

PASSWORD = "demo123"
PASSWORD_HASH = bcrypt.hashpw(PASSWORD.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

DISTRICTS = ["Nashik", "Pune"]

# ---- Farmers ----
FARMERS = [
    {"name": "Ramesh Patil",     "phone": "9000000001", "location": "Nashik"},
    {"name": "Sunita Jadhav",    "phone": "9000000002", "location": "Nashik"},
    {"name": "Vikram Shinde",    "phone": "9000000003", "location": "Pune"},
    {"name": "Anita Gaikwad",    "phone": "9000000004", "location": "Pune"},
    {"name": "Prakash More",     "phone": "9000000005", "location": "Nashik"},
    {"name": "Sanjay Deshmukh",  "phone": "9000000006", "location": "Nashik"},
    {"name": "Kavita Pawar",     "phone": "9000000007", "location": "Pune"},
    {"name": "Manoj Kale",       "phone": "9000000008", "location": "Nashik"},
    {"name": "Rekha Bhosale",    "phone": "9000000009", "location": "Pune"},
    {"name": "Dattatray Wagh",   "phone": "9000000010", "location": "Nashik"},
]

# ---- Buyers ----
BUYERS = [
    {"name": "Fresh Mart Traders",       "phone": "9000000101", "location": "Pune"},
    {"name": "Nashik AgriExports",       "phone": "9000000102", "location": "Nashik"},
    {"name": "Deccan Wholesale Co.",     "phone": "9000000103", "location": "Pune"},
    {"name": "GreenLeaf Processors",     "phone": "9000000104", "location": "Nashik"},
    {"name": "Maharashtra Mandi Group",  "phone": "9000000105", "location": "Pune"},
    {"name": "Sahyadri FoodChain",       "phone": "9000000106", "location": "Nashik"},
]

# crop -> (typical price_min, typical price_max) used to build realistic listings/demands
CROP_PRICE_RANGE = {
    "onion":  (1200, 2200),
    "tomato": (900, 1800),
    "cotton": (5500, 7200),
}
QUALITY_GRADES = ["A", "B", "C"]


def run():
    with app.app_context():
        print("Seeding demo data...")

        farmer_objs = []
        for f in FARMERS:
            existing = User.query.filter_by(phone=f["phone"]).first()
            if existing:
                farmer_objs.append(existing)
                continue
            u = User(
                name=f["name"],
                phone=f["phone"],
                password_hash=PASSWORD_HASH,
                role="farmer",
                location=f["location"],
                verified=True,
            )
            db.session.add(u)
            farmer_objs.append(u)
        db.session.commit()

        buyer_objs = []
        for b in BUYERS:
            existing = User.query.filter_by(phone=b["phone"]).first()
            if existing:
                buyer_objs.append(existing)
                continue
            u = User(
                name=b["name"],
                phone=b["phone"],
                password_hash=PASSWORD_HASH,
                role="buyer",
                location=b["location"],
                verified=True,
            )
            db.session.add(u)
            buyer_objs.append(u)
        db.session.commit()

        print(f"  {len(farmer_objs)} farmers, {len(buyer_objs)} buyers ready.")

        # ---- Listings: cycle farmers x crops, vary quantity/grade/price ----
        crops = list(CROP_PRICE_RANGE.keys())
        listing_objs = []
        listing_plan = [
            (0, "onion", 500, "A", 1850),
            (1, "tomato", 300, "B", 1200),
            (2, "cotton", 800, "A", 6800),
            (3, "onion", 650, "B", 1600),
            (4, "tomato", 400, "A", 1550),
            (5, "cotton", 1000, "B", 6200),
            (6, "onion", 300, "C", 1300),
            (7, "tomato", 250, "A", 1700),
            (8, "cotton", 600, "A", 7000),
            (9, "onion", 700, "A", 2000),
            (0, "tomato", 200, "B", 1050),
            (2, "onion", 450, "B", 1750),
            (5, "tomato", 350, "A", 1650),
            (8, "cotton", 900, "C", 5800),
        ]
        for farmer_idx, crop, qty, grade, price in listing_plan:
            farmer = farmer_objs[farmer_idx]
            l = Listing(
                user_id=farmer.id,
                crop=crop,
                quantity=qty,
                quality_grade=grade,
                expected_price=price,
                location=farmer.location,
                status="open",
                created_at=datetime.utcnow() - timedelta(days=len(listing_objs)),
            )
            db.session.add(l)
            listing_objs.append(l)
        db.session.commit()
        print(f"  {len(listing_objs)} listings created.")

        # ---- Demands: buyers wanting crops, price ranges overlapping listings ----
        demand_objs = []
        demand_plan = [
            (0, "onion", 400, "A", 1700, 2100),
            (1, "onion", 600, "B", 1400, 1900),
            (2, "tomato", 350, "A", 1400, 1800),
            (3, "cotton", 700, "A", 6500, 7500),
            (4, "tomato", 300, "B", 1000, 1400),
            (5, "cotton", 900, "B", 5500, 6800),
            (0, "cotton", 500, "C", 5000, 6200),
            (1, "tomato", 250, "A", 1500, 1900),
            (3, "onion", 500, "B", 1500, 2000),
            (4, "onion", 300, "C", 1100, 1500),
        ]
        for buyer_idx, crop, qty, quality_spec, pmin, pmax in demand_plan:
            buyer = buyer_objs[buyer_idx]
            d = Demand(
                user_id=buyer.id,
                crop=crop,
                quantity_needed=qty,
                quality_spec=quality_spec,
                price_min=pmin,
                price_max=pmax,
                location=buyer.location,
            )
            db.session.add(d)
            demand_objs.append(d)
        db.session.commit()
        print(f"  {len(demand_objs)} demands created.")

        # ---- A few Match + Offer records in varied states, so transaction-tracker
        #      isn't empty. Pairs picked to satisfy: same crop AND
        #      demand.price_max >= listing.expected_price * 0.9 ----
        offer_plan = [
            # (listing_index, demand_index, offered_price, offer_status)
            (0, 0, 1800, "accepted"),   # onion 1850 <-> demand price_max 2100
            (2, 3, 6900, "offered"),    # cotton 6800 <-> demand price_max 7500
            (1, 2, 1250, "rejected"),   # tomato 1200 <-> demand price_max 1800
            (3, 8, 1650, "offered"),    # onion 1600 <-> demand price_max 2000
            (5, 5, 6300, "accepted"),   # cotton 6200 <-> demand price_max 6800
        ]
        for l_idx, d_idx, offered_price, status in offer_plan:
            listing = listing_objs[l_idx]
            demand = demand_objs[d_idx]
            match = Match(listing_id=listing.id, demand_id=demand.id,
                          status="accepted" if status == "accepted" else "pending")
            db.session.add(match)
            db.session.flush()  # get match.id before commit
            offer = Offer(
                match_id=match.id,
                offered_price=offered_price,
                status=status,
                created_at=datetime.utcnow() - timedelta(days=offer_plan.index((l_idx, d_idx, offered_price, status))),
            )
            db.session.add(offer)
        db.session.commit()
        print(f"  {len(offer_plan)} matches + offers created.")

        print("\nDone. All seeded users share password: demo123")
        print("Example farmer login: 9000000001 / demo123")
        print("Example buyer login:  9000000101 / demo123")


if __name__ == "__main__":
    run()
