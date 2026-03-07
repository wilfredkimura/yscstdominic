import { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Loader2,
    User,
    X,
    Save,
    ArrowUp,
    ArrowDown
} from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';

export function AdminLeadersPage() {
    const [leaders, setLeaders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLeader, setEditingLeader] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        bio: '',
        image_url: '',
        rank: 0
    });

    useEffect(() => {
        fetchLeaders();
    }, []);

    const fetchLeaders = async () => {
        try {
            const res = await api.get('/leaders');
            setLeaders(res.data);
        } catch (err) {
            console.error('Failed to fetch leaders', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (leader: any = null) => {
        if (leader) {
            setEditingLeader(leader);
            setFormData({
                name: leader.name,
                role: leader.role,
                bio: leader.bio || '',
                image_url: leader.image_url || '',
                rank: leader.rank || 0
            });
        } else {
            setEditingLeader(null);
            setFormData({
                name: '',
                role: '',
                bio: '',
                image_url: '',
                rank: leaders.length
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingLeader) {
                await api.put(`/leaders/${editingLeader.id}`, formData);
            } else {
                await api.post('/leaders', formData);
            }
            setIsModalOpen(false);
            fetchLeaders();
        } catch (err) {
            console.error('Failed to save leader', err);
            alert('Error saving leader details.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Delete this leader profile?')) return;
        try {
            await api.delete(`/leaders/${id}`);
            fetchLeaders();
        } catch (err) {
            console.error('Failed to delete leader', err);
        }
    };

    const handleMove = async (index: number, direction: 'up' | 'down') => {
        const newLeaders = [...leaders];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newLeaders.length) return;

        // Simple swap logic for illustrative purposes; ideally handled by backend rank updates
        const temp = newLeaders[index];
        newLeaders[index] = newLeaders[targetIndex];
        newLeaders[targetIndex] = temp;

        // Update ranks in DB
        try {
            await Promise.all([
                api.put(`/leaders/${newLeaders[index].id}`, { ...newLeaders[index], rank: index }),
                api.put(`/leaders/${newLeaders[targetIndex].id}`, { ...newLeaders[targetIndex], rank: targetIndex })
            ]);
            fetchLeaders();
        } catch (err) {
            console.error('Failed to update ranks', err);
        }
    };

    const filteredLeaders = leaders.filter(l =>
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading && leaders.length === 0) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-burgundy" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-serif font-bold text-navy">YSC Leaders</h2>
                    <p className="text-sm text-navy/50">Manage the core team members shown on the About page.</p>
                </div>
                <Button onClick={() => handleOpenModal()} className="flex items-center space-x-2">
                    <Plus size={18} />
                    <span>Add Leader</span>
                </Button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-navy/5">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/30" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or role..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-softWhite border border-navy/10 rounded-lg focus:ring-2 focus:ring-burgundy outline-none"
                    />
                </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLeaders.map((leader, index) => (
                    <div key={leader.id} className="bg-white rounded-2xl shadow-sm border border-navy/5 overflow-hidden group">
                        <div className="aspect-square relative overflow-hidden bg-navy/5">
                            {leader.image_url ? (
                                <img src={leader.image_url} alt={leader.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-navy/20">
                                    <User size={64} />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-navy/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
                                <button onClick={() => handleOpenModal(leader)} className="p-3 bg-white text-navy rounded-full hover:bg-gold transition-colors">
                                    <Edit2 size={20} />
                                </button>
                                <button onClick={() => handleDelete(leader.id)} className="p-3 bg-white text-red-600 rounded-full hover:bg-red-50 transition-colors">
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-serif font-bold text-xl text-navy">{leader.name}</h3>
                                    <p className="text-burgundy font-medium text-sm">{leader.role}</p>
                                </div>
                                <div className="flex flex-col space-y-1">
                                    <button onClick={() => handleMove(index, 'up')} disabled={index === 0} className="p-1 hover:bg-navy/5 rounded disabled:opacity-20">
                                        <ArrowUp size={16} />
                                    </button>
                                    <button onClick={() => handleMove(index, 'down')} disabled={index === leaders.length - 1} className="p-1 hover:bg-navy/5 rounded disabled:opacity-20">
                                        <ArrowDown size={16} />
                                    </button>
                                </div>
                            </div>
                            <p className="text-sm text-navy/60 line-clamp-3">{leader.bio}</p>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-navy/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-4 sm:p-6 border-b border-navy/5 flex items-center justify-between bg-navy text-softWhite">
                            <h3 className="text-lg sm:text-xl font-serif font-bold">{editingLeader ? 'Edit Leader' : 'Add New Leader'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-navy/70">Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 bg-softWhite border border-navy/10 rounded-lg focus:ring-2 focus:ring-burgundy outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-navy/70">Role/Position</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-4 py-2 bg-softWhite border border-navy/10 rounded-lg focus:ring-2 focus:ring-burgundy outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-navy/70">Image URL</label>
                                <input
                                    type="text"
                                    value={formData.image_url}
                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                    className="w-full px-4 py-2 bg-softWhite border border-navy/10 rounded-lg focus:ring-2 focus:ring-burgundy outline-none"
                                    placeholder="https://images.unsplash.com/..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-navy/70">Bio/Description</label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    className="w-full px-4 py-2 bg-softWhite border border-navy/10 rounded-lg focus:ring-2 focus:ring-burgundy outline-none h-32"
                                />
                            </div>

                            <div className="pt-4 flex justify-end space-x-3">
                                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading} className="flex items-center space-x-2">
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    <span>{editingLeader ? 'Update Profile' : 'Add Leader'}</span>
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
