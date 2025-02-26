// App.js
import React, { useEffect, useState } from "react";
import { fetchTopStocks } from "./api";
import "./styles.css";

// Array of fun images
const funImages = [
  "https://i.imgur.com/doMt0IZ.jpeg",
  "https://i.imgur.com/jIkKjYh.jpg",
  "https://i.imgur.com/P4rDs7k.jpg",
  "https://i.imgur.com/WG2XX0n.jpg",
  "https://i.imgur.com/hqqAmS7.jpg",
  "https://i.imgur.com/3FMbUXp.jpg",
];

// Helper for daily image
function getDailyImage() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const index = dayOfYear % funImages.length;
  return funImages[index];
}

// Emojis for sentiment
function getSentimentEmoji(sentiment) {
  switch (sentiment) {
    case "Bullish":
      return "🚀";
    case "Bearish":
      return "🐻";
    case "Positive":
      return "💹";
    case "Neutral":
      return "😐";
    case "Negative":
      return "⚠️";
    default:
      return "❓";
  }
}

function App() {
  const [topStocks, setTopStocks] = useState([]);
  const [bestPick, setBestPick] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState(null);
  const [dailyImage, setDailyImage] = useState(null);

  useEffect(() => {
    async function loadStocks() {
      const data = await fetchTopStocks();
      if (data && data.top_stocks) {
        setTopStocks(data.top_stocks);
        setBestPick(data.best_pick);
        setLastFetch(new Date().toLocaleString());
      }
      setLoading(false);
      setDailyImage(getDailyImage());
    }
    loadStocks();
  }, []);

  if (loading) {
    return <div className="loading">Loading penny stocks...</div>;
  }

  return (
    <div className="app-container">
      <h1>Top Penny Stocks (Predicted to Skyrocket)</h1>

      <div className="explanation">
        <p>
          <strong>How This Works:</strong> We automatically fetch real-time stock data
          from the free Alpha Vantage API. Our system filters out stocks priced under $5
          (penny stocks), applies a custom scoring algorithm (based on volume, price,
          and other factors), and displays the top five picks. The highest-scoring
          pick is highlighted as the <em>Best Pick of the Day</em>.
        </p>
        {lastFetch && (
          <p className="timestamp">
            <em>Last updated at: {lastFetch}</em>
          </p>
        )}
      </div>

      {bestPick && (
        <div className="highlight-card">
          <h2>Best Pick of the Day</h2>
          {/* We pass dailyImage to show in this card */}
          <StockCard stock={bestPick} dailyImage={dailyImage} bestPick />
        </div>
      )}

      <div className="stock-grid">
        {topStocks.map((stock, i) => (
          <StockCard key={i} stock={stock} />
        ))}
      </div>

      <div className="disclaimer">
        <p>
          <strong>Disclaimer:</strong> This application provides information for
          educational and entertainment purposes only. It is <em>not</em> financial
          advice. Penny stocks can be highly volatile and risky; invest at your own
          discretion. Always do your own research or consult a professional advisor
          before making any investment decisions.
        </p>
      </div>
    </div>
  );
}

function StockCard({ stock, dailyImage, bestPick }) {
  // For fun, add emojis to sentiment or certain fields
  const sentimentEmoji = getSentimentEmoji(stock.sentiment);

  // If you like, add emojis to volume or price:
  // e.g. volume => '💥'
  // e.g. price => '💵'
  return (
    <div
      className="stock-card"
      style={{
        // For the best pick, scale similarly to others but allow enough space
        maxWidth: bestPick ? "400px" : "250px",
      }}
    >
      {/* If dailyImage prop is passed, display it */}
      {dailyImage && (
        <div className="fun-graphic">
          <img
            src={dailyImage}
            alt="Fun Stock Graphic"
            style={{ maxWidth: "100%", marginBottom: "1rem", borderRadius: "8px" }}
          />
        </div>
      )}

      <h3>{stock.symbol}</h3>
      <p>
        Price: ${stock.price.toFixed(2)} <span role="img" aria-label="money">
          💵
        </span>
      </p>
      <p>
        Volume: {stock.volume.toLocaleString()} <span role="img" aria-label="explode">
          💥
        </span>
      </p>
      <p>
        Score: {stock.score} {stock.score > 2 ? "🎉" : ""}
      </p>
      <p>
        Sentiment: {stock.sentiment} {sentimentEmoji}
      </p>
      <p>Recommendation: {stock.recommendation}</p>
    </div>
  );
}

export default App;
