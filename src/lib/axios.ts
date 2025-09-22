"use client";

import axios from "axios";
import { getAuthToken, clearAuthToken } from "./auth";

// Use the default axios singleton so Orval-generated calls (which import 'axios') share interceptors.
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

axios.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (resp) => resp,
  (error) => {
    const status: number | undefined = error?.response?.status;
    if (status === 401 || status === 403) {
      clearAuthToken();
    }
    return Promise.reject(error);
  }
);

export default axios;


