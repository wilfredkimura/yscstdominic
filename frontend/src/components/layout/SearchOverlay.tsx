import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, X, Loader2, Calendar, FileText, ArrowRight } from 'lucide-react';
import api from '../../services/api';

interface SearchResult {
    id: number | string;
    title: string;
    subtitle: string;
    slug: string;
    type: 'blog' | 'event';
    date: string;
    tag?: string;
}

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
            setQuery('');
            setResults([]);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeys = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
            } else if (e.key === 'Enter' && activeIndex >= 0) {
                handleSelect(results[activeIndex]);
            }
        };

        window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    }, [isOpen, results, activeIndex]);

    useEffect(() => {
        const fetchContent = async () => {
            if (query.trim().length > 1 || query.trim().length === 0) {
                if (query.trim().length > 1) setLoading(true);
                try {
                    const res = await api.get(`/search?q=${query}`);
                    setResults(res.data);
                    setActiveIndex(-1);
                } catch (err) {
                    console.error('Search failed', err);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
            }
        };

        const timer = setTimeout(fetchContent, query.trim().length === 0 ? 0 : 300);
        return () => clearTimeout(timer);
    }, [query, isOpen]);

    const handleSelect = (result: SearchResult) => {
        onClose();
        if (result.type === 'blog') {
            navigate(`/blog/${result.slug}`);
        } else {
            navigate(`/events?id=${result.id}`); // Or structured event detail page if it existed
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-navy/95 backdrop-blur-md flex flex-col items-center pt-24 px-4 sm:px-6"
        >
            <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 text-white/50 hover:text-white transition-colors"
            >
                <X size={32} />
            </button>

            <div className="w-full max-w-2xl flex flex-col gap-6">
                <div className="relative group/search">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/40 group-focus-within/search:text-gold transition-colors" size={24} />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search for articles, events, news..."
                        className="w-full bg-white/5 border-b-2 border-white/10 px-16 py-6 text-2xl font-serif text-white outline-none focus:border-gold transition-all placeholder:text-white/20"
                    />
                    {loading && (
                        <Loader2 className="absolute right-6 top-1/2 -translate-y-1/2 text-gold animate-spin" size={24} />
                    )}
                </div>

                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                    {results.length > 0 ? (
                        <div className="flex flex-col gap-2">
                            {query.trim().length === 0 && (
                                <h5 className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/30 mb-2 ml-4">Latest Discoveries</h5>
                            )}
                            {results.map((result, idx) => (
                                <button
                                    key={`${result.type}-${result.id}`}
                                    onClick={() => handleSelect(result)}
                                    onMouseEnter={() => setActiveIndex(idx)}
                                    className={`flex items-center gap-4 p-4 rounded-xl text-left transition-all ${activeIndex === idx ? 'bg-white/10 translate-x-1' : 'hover:bg-white/5'}`}
                                >
                                    <div className={`p-3 rounded-lg ${result.type === 'blog' ? 'bg-burgundy/20 text-burgundy' : 'bg-gold/20 text-gold'}`}>
                                        {result.type === 'blog' ? <FileText size={20} /> : <Calendar size={20} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-0.5">
                                            <h4 className="text-white font-medium truncate">{result.title}</h4>
                                            {result.tag && (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gold/60 border border-white/5 whitespace-nowrap">
                                                    {result.tag}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-white/40 text-sm truncate">{result.subtitle}</p>
                                    </div>
                                    <ArrowRight size={16} className={`text-white/20 transition-all ${activeIndex === idx ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
                                </button>
                            ))}
                        </div>
                    ) : query.trim().length > 1 && !loading ? (
                        <div className="text-center py-12 text-white/20 font-serif italic text-lg">
                            No matching results found for "{query}"
                        </div>
                    ) : query.trim().length <= 1 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                                <h5 className="text-gold text-xs font-bold uppercase tracking-widest mb-4">Quick Filters</h5>
                                <div className="flex flex-wrap gap-2">
                                    {['Youth Mass', 'Retreat', 'Reflection', 'Announcement'].map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => setQuery(tag)}
                                            className="px-3 py-1.5 rounded-full bg-white/5 text-xs text-white/60 hover:bg-gold hover:text-navy transition-all"
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>

                <div className="mt-4 flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-white/30 border-t border-white/5 pt-4">
                    <div className="flex gap-4">
                        <span><span className="text-gold px-1 bg-white/5 rounded">↑↓</span> to navigate</span>
                        <span><span className="text-gold px-1 bg-white/5 rounded">↵</span> to select</span>
                    </div>
                    <span>ESC to close</span>
                </div>
            </div>
        </motion.div>
    );
}
