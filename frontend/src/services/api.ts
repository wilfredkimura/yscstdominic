import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';

const api = axios.create({
    baseURL: (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api',
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

export default api;
