import os
import sqlite3
import requests
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS: allow your React frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Setup
def setup_db():
    conn = sqlite3.connect("penny_stocks.db")
    cursor = conn.cursor()
    # Create table if not exists
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS penny_stocks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT,
            symbol TEXT,
            name TEXT,
            price REAL,
            volume INTEGER,
            score REAL,
            sentiment TEXT,
            recommendation TEXT
        )
    ''')
    conn.commit()
    conn.close()

setup_db()

def get_alpha_vantage_data(symbol, api_key):
    """
    Fetch global quote data from Alpha Vantage for a single symbol.
    """
    url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={api_key}"
    resp = requests.get(url)
    if resp.status_code == 200:
        data = resp.json()
        if "Global Quote" in data and "05. price" in data["Global Quote"]:
            quote = data["Global Quote"]
            price = float(quote["05. price"])
            volume = int(quote["06. volume"])
            return price, volume
    return None, None

def score_stock(price, volume):
    """
    Simple scoring function:
    - Higher volume => higher score
    - Lower price (but still near $5) => potential bigger gain
    - You can refine this logic or plug in an LLM/ChatGPT call externally.
    """
    base_score = 0

    # Score for price (closer to 5 is higher potential up to a point)
    # If price is under $1, maybe risk is too high => reduce score
    if price < 1:
        base_score -= 1
    elif price < 5:
        base_score += (5 - price) * 0.5  # Increases the closer it is to 5

    # Score for volume
    if volume > 10_000_000:
        base_score += 2
    elif volume > 1_000_000:
        base_score += 1

    return base_score

@app.get("/")
def root():
    return {"message": "Penny Stock AI is running!"}

@app.get("/penny-stocks")
def get_penny_stocks():
    """
    1. Fetch a list of potential penny stocks (under $5).
    2. Score them using 'score_stock'.
    3. Return top five & highlight the best pick.
    """
    # Example penny stock symbols. In production, pick these dynamically.
    # Could also parse from a watchlist or external resource.
    candidate_symbols = ["SNDL", "HCMC", "NIO", "PLTR", "BBIG", "CYDY", "FCEL", "IDEX"]

    api_key = os.getenv("ALPHA_VANTAGE_API_KEY", None)
    if not api_key:
        return {"error": "Missing ALPHA_VANTAGE_API_KEY environment variable"}

    penny_stocks = []
    for symbol in candidate_symbols:
        price, volume = get_alpha_vantage_data(symbol, api_key)
        if price is not None and price < 5.0:
            s = score_stock(price, volume)
            sentiment = "Neutral"  # placeholder
            recommendation = "Hold" # placeholder

            # Example if we want to refine:
            if s > 2:
                sentiment = "Bullish"
                recommendation = "Buy"
            elif s < 0:
                sentiment = "Bearish"
                recommendation = "Sell"

            # Add to list
            penny_stocks.append({
                "symbol": symbol,
                "price": price,
                "volume": volume,
                "score": round(s, 2),
                "sentiment": sentiment,
                "recommendation": recommendation
            })

    # Sort by score descending
    penny_stocks.sort(key=lambda x: x["score"], reverse=True)

    # Take top five
    top_five = penny_stocks[:5] if len(penny_stocks) >= 5 else penny_stocks

    # Best pick is top_five[0] if it exists
    best_pick = top_five[0] if top_five else None

    # Save each pick into DB
    conn = sqlite3.connect("penny_stocks.db")
    cursor = conn.cursor()
    for stock in top_five:
        cursor.execute('''
            INSERT INTO penny_stocks (date, symbol, name, price, volume, score, sentiment, recommendation)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            datetime.now().strftime("%Y-%m-%d"),
            stock["symbol"],
            stock["symbol"],  # placeholder name
            stock["price"],
            stock["volume"],
            stock["score"],
            stock["sentiment"],
            stock["recommendation"],
        ))
    conn.commit()
    conn.close()

    return {
        "top_stocks": top_five,
        "best_pick": best_pick
    }
