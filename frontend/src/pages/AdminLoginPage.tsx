import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Church, Lock } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Button } from '../components/ui/Button';

export function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Redirect if already logged in as admin
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('ysc_token');
            if (token) {
                try {
                    const res = await api.get('/auth/me');
                    if (res.data?.role === 'Admin') {
                        const from = (location.state as any)?.from?.pathname || '/admin';
                        navigate(from, { replace: true });
                    }
                } catch {
                    // Token invalid, stay on login page
                }
            }
        };
        checkAuth();
    }, [navigate, location]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await api.post('/auth/login', { email, password });
            if (res.data.user?.role !== 'Admin') {
                setError('Admin access only');
                return;
            }
            login(res.data.token, res.data.user);
            const from = (location.state as any)?.from?.pathname || '/admin';
            navigate(from, { replace: true });
        } catch (err: any) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 bg-cream">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-lg w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-navy/5"
            >
                <div className="p-8 md:p-12">
                    <div className="text-center mb-8">
                        <div className="bg-burgundy p-3 rounded-xl w-fit mx-auto mb-6 shadow-lg">
                            <Lock size={32} className="text-gold" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-navy mb-2">
                            Admin Dashboard
                        </h2>
                        <p className="text-navy/60">
                            Sign in to access the administration panel
                        </p>
                    </div>

                    <div className="relative z-10 mt-8 pt-8 border-t border-navy/5">
                        <div className="flex items-center space-x-5">
                            <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center border border-gold/20 shadow-inner">
                                <Church size={24} className="text-gold" />
                            </div>
                            <div>
                                <p className="font-bold text-sm uppercase tracking-[0.2em] text-gold/90">St. Theresa Kalimoni</p>
                                <p className="text-xs opacity-50 italic">YSC St. Dominic Administration</p>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-navy/60 font-bold uppercase tracking-wider text-[10px] mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-cream/30 border border-navy/10 rounded-xl px-4 py-3 text-navy text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20"
                                placeholder="admin@yscstdominic.org"
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div>
                            <label className="block text-navy/60 font-bold uppercase tracking-wider text-[10px] mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-cream/30 border border-navy/10 rounded-xl px-4 py-3 text-navy text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20"
                                placeholder="••••••••"
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        <Button type="submit" className="w-full py-3 rounded-xl text-sm tracking-widest uppercase bg-burgundy hover:bg-burgundy-light text-gold font-bold mt-4" disabled={loading}>
                            {loading ? 'Signing in...' : 'Access Dashboard'}
                        </Button>
                    </form>

                    <div className="mt-8 text-center text-sm text-navy/60">
                        <Link to="/" className="text-burgundy hover:text-burgundy-light font-bold flex items-center justify-center gap-2">
                            ← Back to Public Site
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}