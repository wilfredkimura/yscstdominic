import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import api from '../services/api';

export interface User {
    id: number | string;
    email: string;
    full_name: string;
    role: string;
    profile_image_url?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('ysc_token'));
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem('ysc_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [loading, setLoading] = useState<boolean>(true);

    const login = useCallback((newToken: string, newUser: User) => {
        localStorage.setItem('ysc_token', newToken);
        localStorage.setItem('ysc_user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('ysc_token');
        localStorage.removeItem('ysc_user');
        setToken(null);
        setUser(null);
    }, []);

    useEffect(() => {
        const fetchMe = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const res = await api.get('/auth/me');
                setUser(res.data);
                localStorage.setItem('ysc_user', JSON.stringify(res.data));
            } catch (err) {
                console.error('Session expired or invalid token', err);
                logout();
            } finally {
                setLoading(false);
            }
        };

        fetchMe();
    }, [token, logout]);

    const value = useMemo(() => ({
        user,
        token,
        login,
        logout,
        loading
    }), [user, token, login, logout, loading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
