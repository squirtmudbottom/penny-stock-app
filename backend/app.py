import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
import sqlite3
from datetime import datetime

app = FastAPI()

# Allow frontend to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to your frontend's domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup database if it doesn't exist
def setup_db():
    conn = sqlite3.connect("stocks.db")
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS stocks (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        date TEXT,
                        symbol TEXT,
                        name TEXT,
                        price REAL,
                        volume INTEGER,
                        sentiment TEXT,
                        recommendation TEXT)''')
    conn.commit()
    conn.close()

setup_db()

def analyze_stock(price, volume):
    """
    Simple rule-based function to analyze stock performance
    and return a sentiment and recommendation.
    """
    if price > 300:
        sentiment = "Bullish"
        recommendation = "Strong Buy"
    elif price > 200:
        sentiment = "Positive"
        recommendation = "Buy"
    elif price > 100:
        sentiment = "Neutral"
        recommendation = "Hold"
    else:
        sentiment = "Bearish"
        recommendation = "Sell"
    
    if volume > 50_000_000:
        recommendation += " - High Volume"

    return sentiment, recommendation

def get_stock_data(symbol):
    # Pull API key from environment variables
    API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY")
    if not API_KEY:
        return {"error": "Missing API Key"}

    # Alpha Vantage URL
    url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={API_KEY}"
    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        if "Global Quote" in data and "05. price" in data["Global Quote"]:
            price = float(data["Global Quote"]["05. price"])
            volume = int(data["Global Quote"]["06. volume"])
            sentiment, recommendation = analyze_stock(price, volume)

            return {
                "symbol": symbol,
                "name": symbol,
                "price": price,
                "volume": volume,
                "sentiment": sentiment,
                "recommendation": recommendation
            }
        else:
            print(f"Error: Unexpected response structure for {symbol} - {data}")
    else:
        print(f"Error fetching data for {symbol}: {response.status_code}")
    
    return {"error": f"Failed to fetch data for {symbol}"}

@app.get("/")
def read_root():
    return {"message": "Hello, Penny Stock Research API is running!"}

@app.get("/stocks")  # Updated route from /top-stocks to /stocks
def fetch_top_stocks():
    stock_symbols = ["AAPL", "TSLA", "AMZN"]
    results = []
    best_stock = None

    for symbol in stock_symbols:
        stock_info = get_stock_data(symbol)
        if "error" not in stock_info:
            results.append(stock_info)

            # Determine best pick
            if not best_stock or stock_info["recommendation"].startswith("Strong Buy"):
                best_stock = stock_info

            # Store in DB
            conn = sqlite3.connect("stocks.db")
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO stocks (date, symbol, name, price, volume, sentiment, recommendation)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                datetime.now().strftime("%Y-%m-%d"),
                stock_info["symbol"],
                stock_info["name"],
                stock_info["price"],
                stock_info["volume"],
                stock_info["sentiment"],
                stock_info["recommendation"]
            ))
            conn.commit()
            conn.close()
    
    return {
        "top_stocks": results,
        "best_pick": best_stock
    }
