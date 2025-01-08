// Now we can use relative URLs since Next.js handles the routing
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Add better error handling for API calls
export const logApiCall = (...args) => {
  console.log(...args);
}; 