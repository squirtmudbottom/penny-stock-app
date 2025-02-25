import React, { useEffect, useState } from "react";
import { fetchTopStocks } from "./api";
import StockCard from "./StockCard";

function App() {
  const [topStocks, setTopStocks] = useState([]);
  const [bestPick, setBestPick] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getData() {
      const data = await fetchTopStocks();
      if (data && data.top_stocks) {
        setTopStocks(data.top_stocks);
        setBestPick(data.best_pick);
      }
      setLoading(false);
    }
    getData();
  }, []);

  if (loading) return <div className="loading">Loading stock data...</div>;

  return (
    <div className="app-container">
      <h1>Penny Stock Research Dashboard</h1>
      
      {bestPick && (
        <div className="highlight-card">
          <h2>Best Stock Pick of the Day</h2>
          <StockCard stock={bestPick} />
        </div>
      )}

      <h2>Top Stocks</h2>
      <div className="stock-grid">
        {topStocks.map((stock, idx) => (
          <StockCard stock={stock} key={idx} />
        ))}
      </div>
    </div>
  );
}

export default App;
