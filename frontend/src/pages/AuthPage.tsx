import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Church } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Button } from '../components/ui/Button';

export function AuthPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const mode = searchParams.get('mode') || 'signin';
    const isSignIn = mode === 'signin';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const endpoint = isSignIn ? '/auth/login' : '/auth/register';
            const payload = isSignIn ? { email, password } : { email, password, fullName };

            const res = await api.post(endpoint, payload);
            login(res.data.token, res.data.user);
            navigate(res.data.user?.role === 'Admin' ? '/admin' : '/');
        } catch (err: any) {
            setError(err.response?.data?.message || err.response?.data?.error || (isSignIn ? 'Login failed' : 'Registration failed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 bg-cream">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-5xl w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-navy/5"
            >
                {/* Left Side: Branding/Context */}
                <div className="md:w-5/12 bg-navy p-10 md:p-14 text-softWhite flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-burgundy/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px]" />
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-gold/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-[40px]" />

                    <div className="relative z-10">
                        <Link to="/" className="flex items-center space-x-3 mb-16 group">
                            <div className="bg-burgundy p-2 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <Church size={24} className="text-gold" />
                            </div>
                            <span className="font-serif font-bold text-2xl tracking-tight">YSC St. Dominic</span>
                        </Link>

                        <h2 className="text-4xl md:text-5xl font-serif font-bold mb-8 leading-tight">
                            {isSignIn ? "Welcome Back to Faith" : "Begin Your Journey Here"}
                        </h2>
                        <p className="text-cream-dark/80 text-lg leading-relaxed font-light">
                            {isSignIn
                                ? "Sign in to continue your journey of faith, service, and fellowship with the YSC community."
                                : "Join our community to participate in events, share reflections, and grow in Christ together."}
                        </p>
                    </div>

                    <div className="relative z-10 mt-16 pt-10 border-t border-white/10">
                        <div className="flex items-center space-x-5">
                            <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center border border-gold/20 shadow-inner">
                                <Church size={24} className="text-gold" />
                            </div>
                            <div>
                                <p className="font-bold text-sm uppercase tracking-[0.2em] text-gold/90">St. Theresa Kalimoni</p>
                                <p className="text-xs opacity-50 italic">Serving Christ through Youthful Passion</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Native Form */}
                <div className="md:w-7/12 p-8 md:p-14 bg-white flex flex-col justify-center min-h-[600px]">
                    <div className="w-full max-w-md mx-auto">
                        <h3 className="text-3xl font-serif font-bold text-navy mb-2">
                            {isSignIn ? 'Sign In' : 'Create an Account'}
                        </h3>
                        <p className="text-navy/60 text-sm mb-6">
                            {isSignIn ? 'Enter your credentials to access your account' : 'Fill in details below to register'}
                        </p>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isSignIn && (
                                <div>
                                    <label className="block text-navy/60 font-bold uppercase tracking-wider text-[10px] mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full bg-cream/30 border border-navy/10 rounded-xl px-4 py-3 text-navy text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-navy/60 font-bold uppercase tracking-wider text-[10px] mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-cream/30 border border-navy/10 rounded-xl px-4 py-3 text-navy text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20"
                                    placeholder="your.email@example.com"
                                    required
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
                                />
                            </div>

                            <Button type="submit" className="w-full py-3 rounded-xl text-sm tracking-widest uppercase bg-burgundy hover:bg-burgundy-light text-gold font-bold mt-4" disabled={loading}>
                                {loading ? (isSignIn ? 'Signing in...' : 'Registering...') : (isSignIn ? 'Sign In' : 'Create Account')}
                            </Button>
                        </form>

                        <div className="mt-6 text-center text-sm text-navy/60">
                            {isSignIn ? (
                                <p>
                                    Don't have an account?{' '}
                                    <button
                                        onClick={() => setSearchParams({ mode: 'signup' })}
                                        className="text-burgundy hover:text-burgundy-light font-bold"
                                    >
                                        Sign Up
                                    </button>
                                </p>
                            ) : (
                                <p>
                                    Already have an account?{' '}
                                    <button
                                        onClick={() => setSearchParams({ mode: 'signin' })}
                                        className="text-burgundy hover:text-burgundy-light font-bold"
                                    >
                                        Sign In
                                    </button>
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
