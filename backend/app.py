from flask import Flask
from flask_cors import CORS
from extensions import db

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///agri.db'
CORS(app)
db.init_app(app)

from routes.auth import auth_bp
from routes.listings import listings_bp
from routes.demands import demands_bp
from routes.matches import matches_bp
from routes.offers import offers_bp
from routes.prices import prices_bp
from routes.chatbot import chatbot_bp

app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(listings_bp, url_prefix='/listings')
app.register_blueprint(demands_bp, url_prefix='/demands')
app.register_blueprint(matches_bp, url_prefix='/matches')
app.register_blueprint(offers_bp, url_prefix='/offers')
app.register_blueprint(prices_bp, url_prefix='/prices')
app.register_blueprint(chatbot_bp, url_prefix='/chatbot')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)