// api.js
// This file ONLY handles the fetch logic, no React code.

const baseURL = "https://plankton-app-ht33g.ondigitalocean.app";

export async function fetchTopStocks() {
  try {
    const response = await fetch(`${baseURL}/penny-stocks`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data; // { top_stocks: [...], best_pick: {...} }
  } catch (error) {
    console.error("Error fetching penny stocks:", error);
    return null;
  }
}
