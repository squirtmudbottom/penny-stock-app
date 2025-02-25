// Adjust BASE_URL to your deployed backend
const BASE_URL = "https://plankton-app-ht33g.ondigitalocean.app/";

export async function fetchPennyStocks() {
  try {
    const response = await fetch(`${BASE_URL}/penny-stocks`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    const data = await response.json();
    return data; // { top_stocks: [...], best_pick: {...} }
  } catch (err) {
    console.error("Failed to fetch penny stocks:", err);
    return null;
  }
}
