// App.js
import React, { useEffect, useState } from "react";
import { fetchTopStocks } from "./api"; // <--- Import from api.js
import "./styles.css";

function App() {
  const [topStocks, setTopStocks] = useState([]);
  const [bestPick, setBestPick] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState(null); // for storing last fetched time

  useEffect(() => {
    async function loadStocks() {
      const data = await fetchTopStocks();
      if (data && data.top_stocks) {
        setTopStocks(data.top_stocks);
        setBestPick(data.best_pick);
        // Record the timestamp
        setLastFetch(new Date().toLocaleString());
      }
      setLoading(false);
    }
    loadStocks();
  }, []);

  if (loading) {
    return <div className="loading">Loading penny stocks...</div>;
  }

  return (
    <div className="app-container">
      <h1>Top Penny Stocks (Predicted to Skyrocket)</h1>

      {/* Short explanation */}
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
          <StockCard stock={bestPick} />
        </div>
      )}

      <div className="stock-grid">
        {topStocks.map((stock, i) => (
          <StockCard key={i} stock={stock} />
        ))}
      </div>

      {/* Disclaimer */}
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

function StockCard({ stock }) {
  return (
    <div className="stock-card">
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
