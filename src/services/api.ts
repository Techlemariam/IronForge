
import axios from 'axios';

const api = axios.create();

// This interceptor runs before each request
api.interceptors.request.use(config => {
  // Get the latest api key from localStorage
  const apiKey = localStorage.getItem('hevy_api_key');

  if (apiKey) {
    // Add the key to a custom header to be used by the backend proxy
    config.headers['X-Hevy-API-Key'] = apiKey;
  } else {
    // It's better to cancel the request than to send a bad one
    console.error("Hevy API Key ('hevy_api_key') is not set in localStorage.");
    return Promise.reject(new Error("Hevy API Key is not configured. Please check your settings."));
  }

  return config;
}, error => {
  return Promise.reject(error);
});

export default api;
