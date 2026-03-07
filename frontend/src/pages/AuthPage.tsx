import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Church, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export function AuthPage() {
    const [searchParams] = useSearchParams();
    const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'signup');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    // Form states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const payload = isLogin ? { email, password } : { email, password, fullName };

            const res = await api.post(endpoint, payload);
            login(res.data.token, res.data.user);
            navigate(res.data.user.role === 'Admin' ? '/admin' : '/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-20 bg-cream">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl w-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row"
            >
                {/* Left Side: Branding/Context */}
                <div className="md:w-5/12 bg-navy p-8 md:p-12 text-softWhite flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-burgundy/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />

                    <div className="relative z-10">
                        <Link to="/" className="flex items-center space-x-2 mb-12">
                            <div className="bg-burgundy p-1.5 rounded-lg">
                                <Church size={20} className="text-gold" />
                            </div>
                            <span className="font-serif font-bold text-xl tracking-tight">YSC St. Dominic</span>
                        </Link>

                        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 leading-tight">
                            {isLogin ? "Welcome Back to our Community" : "Join the Youth Community"}
                        </h2>
                        <p className="text-cream-dark/70 leading-relaxed">
                            {isLogin
                                ? "Sign in to continue your journey of faith, service, and fellowship."
                                : "Create an account to participate in events, share reflections, and connect with other young Catholics."}
                        </p>
                    </div>

                    <div className="relative z-10 mt-12 pt-8 border-t border-white/10">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20">
                                <Church size={20} className="text-gold" />
                            </div>
                            <div className="text-xs">
                                <p className="font-bold opacity-60 uppercase tracking-widest text-[#D4AF37]">St. Theresa Kalimoni</p>
                                <p className="opacity-40 italic">Serving Christ through Youthful Passion</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="md:w-7/12 p-8 md:p-12 bg-white flex flex-col justify-center">
                    <div className="max-w-sm mx-auto w-full">
                        <div className="flex space-x-8 mb-8 border-b border-navy/5">
                            <button
                                onClick={() => { setIsLogin(true); setError(''); }}
                                className={`pb-4 text-sm font-bold tracking-widest uppercase transition-all relative ${isLogin ? 'text-burgundy' : 'text-navy/30'}`}
                            >
                                Sign In
                                {isLogin && <motion.div layoutId="auth-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-burgundy" />}
                            </button>
                            <button
                                onClick={() => { setIsLogin(false); setError(''); }}
                                className={`pb-4 text-sm font-bold tracking-widest uppercase transition-all relative ${!isLogin ? 'text-burgundy' : 'text-navy/30'}`}
                            >
                                Sign Up
                                {!isLogin && <motion.div layoutId="auth-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-burgundy" />}
                            </button>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isLogin ? 'login' : 'signup'}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {!isLogin && (
                                        <div>
                                            <label className="block text-xs font-bold text-navy/40 uppercase tracking-widest mb-2">Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/20" size={18} />
                                                <input
                                                    type="text"
                                                    required
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    placeholder="John Doe"
                                                    className="w-full pl-10 pr-4 py-3 bg-cream/50 border border-navy/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-burgundy/10 focus:bg-white transition-all text-navy"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-xs font-bold text-navy/40 uppercase tracking-widest mb-2">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/20" size={18} />
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="john@example.com"
                                                className="w-full pl-10 pr-4 py-3 bg-cream/50 border border-navy/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-burgundy/10 focus:bg-white transition-all text-navy"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-navy/40 uppercase tracking-widest mb-2">Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/20" size={18} />
                                            <input
                                                type="password"
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full pl-10 pr-4 py-3 bg-cream/50 border border-navy/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-burgundy/10 focus:bg-white transition-all text-navy"
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-red-500 text-xs bg-red-50 p-3 rounded-lg border border-red-100"
                                        >
                                            {error}
                                        </motion.p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-burgundy text-gold py-4 rounded-xl font-bold tracking-widest uppercase hover:bg-burgundy-light transition-all shadow-lg hover:shadow-burgundy/20 flex items-center justify-center space-x-2 group active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <Loader2 className="animate-spin" size={20} />
                                        ) : (
                                            <>
                                                <span>{isLogin ? "Sign In" : "Register Now"}</span>
                                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </motion.div>
                        </AnimatePresence>

                        <div className="mt-8 text-center">
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-xs text-navy/40 hover:text-burgundy transition-colors font-medium"
                            >
                                {isLogin ? "Need an account? Create one here" : "Already registered? Sign in instead"}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
