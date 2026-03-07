import { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Loader2,
    Shield,
    Mail,
    X,
    Save,
    CheckCircle2
} from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';

export function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        role: 'Member',
        status: 'Active'
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/auth/users');
            setUsers(res.data);
        } catch (err) {
            console.error('Failed to fetch users', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (user: any = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                full_name: user.full_name,
                email: user.email,
                role: user.role,
                status: user.status || 'Active'
            });
        } else {
            setEditingUser(null);
            setFormData({
                full_name: '',
                email: '',
                role: 'Member',
                status: 'Active'
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingUser) {
                await api.put(`/auth/users/${editingUser.id}`, formData);
            } else {
                await api.post('/auth/register', { ...formData, password: 'TemporaryPassword123!' });
            }
            setIsModalOpen(false);
            fetchUsers();
        } catch (err) {
            console.error('Failed to save user', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Deactivate this user account?')) return;
        setLoading(true);
        try {
            await api.delete(`/auth/users/${id}`);
            fetchUsers();
        } catch (err) {
            console.error('Failed to delete user', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = Array.isArray(users) ? users.filter(u =>
        u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    ) : [];

    if (loading && !isModalOpen) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-burgundy" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-serif font-bold text-navy">User Management</h2>
                    <p className="text-sm text-navy/50">Manage community members and administrator roles.</p>
                </div>
                <Button onClick={() => handleOpenModal()} className="flex items-center space-x-2">
                    <Plus size={18} />
                    <span>Add User</span>
                </Button>
            </div>

            <div className="flex gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-navy/5">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/30" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-softWhite border border-navy/10 rounded-lg focus:ring-2 focus:ring-burgundy outline-none"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-navy/5 overflow-hidden overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-navy/[0.02] border-b border-navy/5">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold text-navy">User</th>
                            <th className="px-6 py-4 text-sm font-semibold text-navy">Role</th>
                            <th className="px-6 py-4 text-sm font-semibold text-navy">Status</th>
                            <th className="px-6 py-4 text-sm font-semibold text-navy text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-navy/5">
                        {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-navy/[0.01] transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-navy/5 flex items-center justify-center text-navy font-bold">
                                            {user.full_name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-navy">{user.full_name}</p>
                                            <p className="text-xs text-navy/40 flex items-center">
                                                <Mail size={12} className="mr-1" />
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.role === 'Admin' ? 'bg-burgundy/10 text-burgundy' : 'bg-navy/5 text-navy/60'}`}>
                                        <Shield size={12} className="mr-1" />
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="flex items-center text-xs text-green-600">
                                        <CheckCircle2 size={14} className="mr-1" />
                                        Active
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                        <button
                                            onClick={() => handleOpenModal(user)}
                                            className="p-2 text-navy/40 hover:text-burgundy hover:bg-burgundy/5 rounded-lg transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="p-2 text-navy/40 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-navy/40 font-serif italic text-lg">
                                    No users found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-navy/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-4 sm:p-6 border-b border-navy/5 flex items-center justify-between bg-navy text-softWhite">
                            <h3 className="text-lg sm:text-xl font-serif font-bold">{editingUser ? 'Edit User' : 'Add New User'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-navy/70">Full Name</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full px-4 py-2 bg-softWhite border border-navy/10 rounded-lg focus:ring-2 focus:ring-burgundy outline-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-navy/70">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    value={formData.email}
                                    disabled={!!editingUser}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 bg-softWhite border border-navy/10 rounded-lg focus:ring-2 focus:ring-burgundy outline-none disabled:opacity-50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-navy/70">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-4 py-2 bg-softWhite border border-navy/10 rounded-lg focus:ring-2 focus:ring-burgundy outline-none"
                                >
                                    <option value="Member">Member</option>
                                    <option value="Donor">Donor</option>
                                    <option value="Volunteer">Volunteer</option>
                                    <option value="Admin">Administrator</option>
                                </select>
                            </div>

                            <div className="pt-4">
                                <Button type="submit" disabled={loading} className="w-full flex items-center justify-center space-x-2">
                                    <Save size={18} />
                                    <span>{editingUser ? 'Update User' : 'Create User'}</span>
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
