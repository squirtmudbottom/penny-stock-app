// App.js
import React, { useEffect, useState } from "react";
import { fetchTopStocks } from "./api"; // <--- Import from api.js
import "./styles.css";

function App() {
  const [topStocks, setTopStocks] = useState([]);
  const [bestPick, setBestPick] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStocks() {
      const data = await fetchTopStocks();
      if (data && data.top_stocks) {
        setTopStocks(data.top_stocks);
        setBestPick(data.best_pick);
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
