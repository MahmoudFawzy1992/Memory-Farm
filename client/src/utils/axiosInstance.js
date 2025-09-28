import axios from "axios";

// Token storage for incognito fallback
const TOKEN_KEY = 'mf_auth_token';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api",
  withCredentials: true,
});

// Add token to requests as fallback for incognito mode
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Store token from login response
instance.interceptors.response.use((response) => {
  if (response.config.url?.includes('/auth/login') && response.data.token) {
    localStorage.setItem(TOKEN_KEY, response.data.token);
  }
  if (response.config.url?.includes('/auth/logout')) {
    localStorage.removeItem(TOKEN_KEY);
  }
  return response;
});

export default instance;