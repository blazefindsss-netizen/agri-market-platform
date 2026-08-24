import csv
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app
from extensions import db
from models import PriceHistory
from datetime import datetime

with app.app_context():
    with open(os.path.join(os.path.dirname(__file__), 'prices.csv')) as f:
        reader = csv.DictReader(f)
        count = 0
        for row in reader:
            db.session.add(PriceHistory(
                crop=row['crop'],
                market_name=row['market'],
                district=row['district'],
                price=float(row['modal_price']),
                date=datetime.strptime(row['date'], '%Y-%m-%d')
            ))
            count += 1
        db.session.commit()
    print(f"Seeded {count} price records")