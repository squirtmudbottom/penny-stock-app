import React from "react";

function StockCard({ stock }) {
  return (
    <div className="stock-card">
      <h3>{stock.symbol}</h3>
      <p>Name: {stock.name}</p>
      <p>Price: ${stock.price.toFixed(2)}</p>
      <p>Volume: {stock.volume.toLocaleString()}</p>
      <p>Sentiment: {stock.sentiment}</p>
      <p>Recommendation: {stock.recommendation}</p>
    </div>
  );
}

export default StockCard;
