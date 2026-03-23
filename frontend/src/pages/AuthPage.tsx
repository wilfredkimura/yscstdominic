import { SignIn, SignUp } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { Church } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

export function AuthPage() {
    const [searchParams] = useSearchParams();
    const mode = searchParams.get('mode') || 'signin';

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
                            {mode === 'signin' ? "Welcome Back to Faith" : "Begin Your Journey Here"}
                        </h2>
                        <p className="text-cream-dark/80 text-lg leading-relaxed font-light">
                            {mode === 'signin'
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

                {/* Right Side: Clerk Auth Component */}
                <div className="md:w-7/12 p-8 md:p-14 bg-white flex flex-col items-center justify-center min-h-[600px]">
                    <div className="w-full max-w-md scale-105">
                        {mode === 'signin' ? (
                            <SignIn
                                appearance={{
                                    elements: {
                                        formButtonPrimary: 'bg-burgundy hover:bg-burgundy-light text-gold font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-burgundy/20 text-sm tracking-widest uppercase',
                                        card: 'shadow-none border-none p-0',
                                        headerTitle: 'text-navy font-serif text-3xl font-bold mb-2',
                                        headerSubtitle: 'text-navy/50 text-sm font-medium',
                                        socialButtonsBlockButton: 'border-navy/5 hover:bg-navy/5 transition-colors rounded-xl py-3',
                                        formFieldInput: 'bg-cream/30 border-navy/5 rounded-xl py-3 focus:ring-burgundy/10',
                                        formFieldLabel: 'text-navy/60 font-bold uppercase tracking-wider text-[10px] mb-2',
                                        footerActionLink: 'text-burgundy hover:text-burgundy-light font-bold'
                                    }
                                }}
                                signUpUrl="/signup"
                                routing="path"
                                path="/login"
                            />
                        ) : (
                            <SignUp
                                appearance={{
                                    elements: {
                                        formButtonPrimary: 'bg-burgundy hover:bg-burgundy-light text-gold font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-burgundy/20 text-sm tracking-widest uppercase',
                                        card: 'shadow-none border-none p-0',
                                        headerTitle: 'text-navy font-serif text-3xl font-bold mb-2',
                                        headerSubtitle: 'text-navy/50 text-sm font-medium',
                                        socialButtonsBlockButton: 'border-navy/5 hover:bg-navy/5 transition-colors rounded-xl py-3',
                                        formFieldInput: 'bg-cream/30 border-navy/5 rounded-xl py-3 focus:ring-burgundy/10',
                                        formFieldLabel: 'text-navy/60 font-bold uppercase tracking-wider text-[10px] mb-2',
                                        footerActionLink: 'text-burgundy hover:text-burgundy-light font-bold'
                                    }
                                }}
                                signInUrl="/login"
                                routing="path"
                                path="/signup"
                            />
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
