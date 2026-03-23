import axios from 'axios';

const api = axios.create({
    baseURL: (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api',
});

// Interceptors are now handled by the AxiosInterceptor component in the frontend
// to support dynamic Clerk token injection.

export default api;
