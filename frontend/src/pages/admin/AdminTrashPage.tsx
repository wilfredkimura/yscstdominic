import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, RotateCcw, AlertCircle, Loader2, FileText, Calendar, ShieldAlert } from 'lucide-react';
import api from '../../services/api';

interface TrashItem {
    id: number;
    title: string;
    deleted_at: string;
    type: 'blog' | 'event';
}

export default function AdminTrashPage() {
    const [items, setItems] = useState<{ blogs: TrashItem[], events: TrashItem[] }>({ blogs: [], events: [] });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const fetchTrash = async () => {
        try {
            const res = await api.get('/admin/trash');
            setItems(res.data);
        } catch (err) {
            console.error('Failed to fetch trash', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrash();
    }, []);

    const handleRestore = async (id: number, type: string) => {
        setActionLoading(`${type}-${id}`);
        try {
            await api.post('/admin/trash/restore', { id, type });
            setMessage({ type: 'success', text: 'Item restored successfully!' });
            fetchTrash();
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to restore' });
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id: number, type: string) => {
        if (!confirm('This action cannot be undone. Are you sure you want to permanently delete this item?')) return;

        setActionLoading(`delete-${type}-${id}`);
        try {
            await api.delete(`/admin/trash/${type}/${id}`);
            setMessage({ type: 'success', text: 'Item permanently deleted.' });
            fetchTrash();
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to delete' });
        } finally {
            setActionLoading(null);
        }
    };

    const allItems = [...items.blogs, ...items.events].sort((a, b) =>
        new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime()
    );

    return (
        <div className="space-y-8 pb-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl shadow-sm border border-navy/5">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                            <Trash2 size={24} />
                        </div>
                        <h1 className="text-3xl font-serif font-bold text-navy">Trash Management</h1>
                    </div>
                    <p className="text-navy/50">Restore soft-deleted blog posts and events or delete them permanently.</p>
                </div>
            </header>

            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
                    >
                        {message.type === 'success' ? <RotateCcw size={20} /> : <AlertCircle size={20} />}
                        <span className="font-medium">{message.text}</span>
                        <button onClick={() => setMessage(null)} className="ml-auto hover:opacity-70">
                            <X size={18} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="bg-white rounded-3xl shadow-sm border border-navy/5 overflow-hidden">
                <div className="p-6 border-b border-navy/5 bg-navy/[0.02]">
                    <h2 className="font-bold text-navy uppercase tracking-widest text-xs">Recently Deleted</h2>
                </div>

                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4 text-navy/40">
                        <Loader2 size={40} className="animate-spin" />
                        <p className="font-serif italic text-lg">Loading the trash can...</p>
                    </div>
                ) : allItems.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-6 text-center px-4">
                        <div className="w-24 h-24 bg-navy/[0.03] rounded-full flex items-center justify-center text-navy/10">
                            <Trash2 size={48} strokeWidth={1} />
                        </div>
                        <div className="max-w-xs">
                            <p className="font-serif italic text-xl text-navy/40 mb-2">The trash is empty</p>
                            <p className="text-navy/30 text-sm italic">Hooray! No deleted items found in the system right now.</p>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-navy/[0.01] text-navy/50 text-xs uppercase tracking-widest border-b border-navy/5">
                                    <th className="px-6 py-4 font-bold">Item</th>
                                    <th className="px-6 py-4 font-bold">Type</th>
                                    <th className="px-6 py-4 font-bold">Deleted Date</th>
                                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-navy/5">
                                {allItems.map((item) => (
                                    <tr key={`${item.type}-${item.id}`} className="hover:bg-navy/[0.01] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${item.type === 'blog' ? 'bg-burgundy/10 text-burgundy' : 'bg-gold/10 text-gold'}`}>
                                                    {item.type === 'blog' ? <FileText size={18} /> : <Calendar size={18} />}
                                                </div>
                                                <span className="font-medium text-navy group-hover:text-burgundy transition-colors">{item.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${item.type === 'blog' ? 'bg-burgundy/5 text-burgundy' : 'bg-gold/5 text-gold'}`}>
                                                {item.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-navy/50">
                                            {new Date(item.deleted_at).toLocaleDateString()} at {new Date(item.deleted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleRestore(item.id, item.type)}
                                                    disabled={!!actionLoading}
                                                    title="Restore"
                                                    className="p-2 text-navy/40 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all active:scale-95 disabled:opacity-50"
                                                >
                                                    {actionLoading === `${item.type}-${item.id}` ? (
                                                        <Loader2 size={18} className="animate-spin" />
                                                    ) : (
                                                        <RotateCcw size={18} />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id, item.type)}
                                                    disabled={!!actionLoading}
                                                    title="Delete Permanently"
                                                    className="p-2 text-navy/40 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-95 disabled:opacity-50"
                                                >
                                                    {actionLoading === `delete-${item.type}-${item.id}` ? (
                                                        <Loader2 size={18} className="animate-spin" />
                                                    ) : (
                                                        <Trash2 size={18} />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="p-6 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-4">
                <div className="p-2 bg-red-100 text-red-600 rounded-xl">
                    <ShieldAlert size={20} />
                </div>
                <div>
                    <h4 className="text-red-900 font-bold mb-1 uppercase tracking-widest text-[10px]">Security Note</h4>
                    <p className="text-red-700/80 text-sm leading-relaxed">
                        Permanently deleting items from the trash will remove them forever from the database. This action includes all associated comments and RSVPs.
                    </p>
                </div>
            </div>
        </div>
    );
}

const X = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6L6 18M6 6l12 12" />
    </svg>
);
