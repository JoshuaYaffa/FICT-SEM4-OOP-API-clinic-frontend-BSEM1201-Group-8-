import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:8000/api/v1",
    headers: {
        "Content-Type": "application/json"
    },
    timeout: 30000,
});

// Request interceptor to add token to all requests
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error("Request Error:", error);
        return Promise.reject(error);
    }
);

// Response interceptor to handle token expiration
API.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            localStorage.removeItem("access_token");
            window.location.href = "/login";
        }
        
        console.error("Response Error:", {
            url: error.config?.url,
            status: error.response?.status,
            message: error.message,
            data: error.response?.data
        });
        
        return Promise.reject(error);
    }
);

export default API;