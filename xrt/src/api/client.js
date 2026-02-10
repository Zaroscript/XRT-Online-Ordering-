import axios from "axios";
import { API_CONFIG } from "@/config/api";

/**
 * Axios instance for the custom server API.
 * Add request/response interceptors here (e.g. auth token, error handling).
 */
export const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    "Content-Type": "application/json",
  },
});

// Example: add auth token when you implement auth
// apiClient.interceptors.request.use((config) => {
//   const token = getAuthToken();
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });
