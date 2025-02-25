const API_BASE_URL = "https://plankton-app-ht33g.ondigitalocean.app";

export async function fetchTopStocks() {
  try {
    const response = await fetch(`${API_BASE_URL}/stocks`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching top stocks:", error);
    return null;
  }
}
