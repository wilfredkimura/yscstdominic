import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import api from '../../services/api';

export const AxiosInterceptor = ({ children }: { children: React.ReactNode }) => {
    const { getToken } = useAuth();

    useEffect(() => {
        const interceptor = api.interceptors.request.use(
            async (config) => {
                try {
                    const token = await getToken();
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                } catch (error) {
                    console.error('Error fetching Clerk token', error);
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        return () => {
            api.interceptors.request.eject(interceptor);
        };
    }, [getToken]);

    return <>{children}</>;
};
