// App.js
import React, { useEffect, useState } from "react";
import { fetchTopStocks } from "./api";
import "./styles.css";

// Array of fun images (replace URLs with your own hosted images)
const funImages = [
  "https://i.imgur.com/doMt0IZ.jpeg", // e.g. "Ben Franklin wearing sunglasses"
  "https://i.imgur.com/jIkKjYh.jpg", // e.g. "Bear behind wild stock market"
  "https://i.imgur.com/P4rDs7k.jpg", // e.g. "Funny bull in sunglasses"
  "https://i.imgur.com/WG2XX0n.jpg", // or any other stock-themed silly images
  "https://i.imgur.com/hqqAmS7.jpg",
  "https://i.imgur.com/3FMbUXp.jpg",
];

// Helper to pick an image once per day
function getDailyImage() {
  // For uniqueness, use day of the year (1-365)
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  // Use dayOfYear mod the number of images
  const index = dayOfYear % funImages.length;
  return funImages[index];
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
      setDailyImage(getDailyImage()); // pick the fun graphic for today
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
          {/* Pass the dailyImage into the StockCard */}
          <StockCard stock={bestPick} dailyImage={dailyImage} />
        </div>
      )}

      <div className="stock-grid">
        {topStocks.map((stock, i) => (
          // For normal stocks, we won't pass dailyImage
          // but if you want the daily image in *all* stocks, pass dailyImage here too
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

function StockCard({ stock, dailyImage }) {
  return (
    <div className="stock-card">
      {/* If dailyImage prop is passed, display it in the card */}
      {dailyImage && (
        <div className="fun-graphic">
          <img
            src={dailyImage}
            alt="Fun Stock Graphic"
            style={{ maxWidth: "300px", marginBottom: "1rem" }}
          />
        </div>
      )}

      <h3>{stock.symbol}</h3>
      <p>Price: ${stock.price.toFixed(2)}</p>
      <p>Volume: {stock.volume.toLocaleString()}</p>
      <p>Score: {stock.score}</p>
      <p>Sentiment: {stock.sentiment}</p>
      <p>Recommendation: {stock.recommendation}</p>
    </div>
  );
}

export default App;
