import axios from "axios";
import type { AxiosInstance } from "axios";
const baseURL: string = import.meta.env.PROD
  ? (import.meta.env.VITE_API_URL as string)
  : "http://localhost:5001";

export const api: AxiosInstance = axios.create({
  baseURL,
  timeout: 8000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 404) {
      console.error("NOT FOUND ERROR");
    }
    if (status === 500) {
      console.log("SERVER ERROR");
    }
    return Promise.reject(error);
  },
);
