import axios from "axios";
import { io } from "socket.io-client";

// Cấu hình URL cho Backend API và Socket.IO
const BACKEND_URL = "http://localhost:3000";
const API_BASE_URL = `${BACKEND_URL}/api`;

// Cấu hình Axios để gọi các REST APIs
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// THÊM: Interceptor tự động nhúng Token vào header nếu có
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Cấu hình Socket.IO để nhận dữ liệu thời gian thực
export const socket = io(BACKEND_URL, {
  autoConnect: true,
  auth: (cb) => {
    cb({ token: localStorage.getItem("token") });
  },
});
