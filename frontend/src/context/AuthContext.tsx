import React, { createContext, useContext, useMemo } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import api from '../services/api';

interface User {
    id: number | string;
    email: string;
    full_name: string;
    role: string;
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
    const { isLoaded, isSignedIn, user: clerkUser } = useUser();
    const { signOut } = useClerkAuth();

    const user = useMemo(() => {
        if (!isLoaded || !isSignedIn || !clerkUser) return null;

        return {
            id: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress || '',
            full_name: clerkUser.fullName || '',
            role: (clerkUser.publicMetadata?.role as string) || 'Registered User'
        };
    }, [isLoaded, isSignedIn, clerkUser]);

    // Sync with local DB
    React.useEffect(() => {
        if (isSignedIn && clerkUser) {
            const syncUser = async () => {
                try {
                    const email = clerkUser.primaryEmailAddress?.emailAddress;
                    const fullName = clerkUser.fullName;
                    const profileImageUrl = clerkUser.imageUrl;

                    await api.post('/auth/sync', { email, fullName, profileImageUrl });
                } catch (err) {
                    console.error('Failed to sync user with local DB', err);
                }
            };
            syncUser();
        }
    }, [isSignedIn, clerkUser]);

    const value = useMemo(() => ({
        user,
        token: null, // Clerk tokens are fetched dynamically via getToken() in the Axios interceptor
        login: () => { console.warn('Local login is disabled. Use Clerk instead.'); },
        logout: () => signOut(),
        loading: !isLoaded
    }), [user, isLoaded, signOut]);

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
