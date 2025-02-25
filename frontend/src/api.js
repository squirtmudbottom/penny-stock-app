// Adjust the baseURL below to point to your deployed backend
const baseURL = "plankton-app-ht33g.ondigitalocean.app";

export async function fetchTopStocks() {
  try {
    const response = await fetch(`${baseURL}/top-stocks`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching top stocks:", error);
    return null;
  }
}
