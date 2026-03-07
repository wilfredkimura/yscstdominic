import React, { useState, useEffect } from 'react';
import {
    Plus,
    Trash2,
    Loader2,
    X,
    Save,
    Image as ImageIcon,
    Tag
} from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';

export function AdminGalleryPage() {
    const [items, setItems] = useState<any[]>([]);
    const [albums, setAlbums] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        caption: '',
        album_id: '',
        image_url: ''
    });
    const [albumFormData, setAlbumFormData] = useState({
        title: '',
        description: '',
        cover_image_url: ''
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [galleryRes, albumsRes] = await Promise.all([
                api.get('/gallery'),
                api.get('/gallery/albums')
            ]);
            setItems(galleryRes.data);
            setAlbums(albumsRes.data);
            if (albumsRes.data.length > 0) {
                setFormData(prev => ({ ...prev, album_id: albumsRes.data[0].id }));
            }
        } catch (err) {
            console.error('Failed to fetch data', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchItems = async () => {
        try {
            const res = await api.get('/gallery');
            setItems(res.data);
        } catch (err) {
            console.error('Failed to fetch gallery items', err);
        }
    };

    const fetchAlbums = async () => {
        try {
            const res = await api.get('/gallery/albums');
            setAlbums(res.data);
        } catch (err) {
            console.error('Failed to fetch albums', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/gallery', formData);
            setIsModalOpen(false);
            setFormData({ title: '', caption: '', album_id: albums[0]?.id || '', image_url: '' });
            fetchItems();
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || 'Failed to save gallery item';
            alert(errorMsg);
            console.error('Failed to save gallery item', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAlbumSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/gallery/albums', albumFormData);
            setIsAlbumModalOpen(false);
            setAlbumFormData({ title: '', description: '', cover_image_url: '' });
            fetchAlbums();
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || 'Failed to create album';
            alert(errorMsg);
            console.error('Failed to create album', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Remove this memory from the gallery?')) return;
        setLoading(true);
        try {
            await api.delete(`/gallery/${id}`);
            fetchItems();
        } catch (err) {
            console.error('Failed to delete gallery item', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !isModalOpen) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-burgundy" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-serif font-bold text-navy">Gallery Management</h2>
                    <p className="text-sm text-navy/50">Manage the visual history of our youth group.</p>
                </div>
                <div className="flex space-x-3">
                    <Button onClick={() => setIsAlbumModalOpen(true)} variant="secondary" className="flex items-center space-x-2">
                        <Plus size={18} />
                        <span>Create Album</span>
                    </Button>
                    <Button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2">
                        <Plus size={18} />
                        <span>Add Photo</span>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.isArray(items) && items.map((item) => (
                    <div key={item.id} className="group relative bg-white rounded-xl overflow-hidden shadow-sm border border-navy/5 hover:shadow-md transition-all">
                        <div className="aspect-[4/3] overflow-hidden">
                            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="p-4">
                            <h4 className="font-medium text-navy line-clamp-1">{item.title}</h4>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-navy/40 flex items-center">
                                    <Tag size={12} className="mr-1" />
                                    {albums.find(a => a.id === item.album_id)?.title || 'Uncategorized'}
                                </span>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="text-red-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-navy/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-4 sm:p-6 border-b border-navy/5 flex items-center justify-between bg-navy text-softWhite">
                            <div className="flex items-center space-x-3">
                                <ImageIcon size={20} className="text-gold" />
                                <h3 className="text-lg sm:text-xl font-serif font-bold">Add to Gallery</h3>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-navy/70">Photo Title</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 bg-softWhite border border-navy/10 rounded-lg focus:ring-2 focus:ring-burgundy outline-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-navy/70">Album</label>
                                <select
                                    required
                                    value={formData.album_id}
                                    onChange={(e) => setFormData({ ...formData, album_id: e.target.value })}
                                    className="w-full px-4 py-2 bg-softWhite border border-navy/10 rounded-lg focus:ring-2 focus:ring-burgundy outline-none"
                                >
                                    <option value="" disabled>Select an album</option>
                                    {albums.map(album => (
                                        <option key={album.id} value={album.id}>{album.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-navy/70">Image URL</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.image_url}
                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                    className="w-full px-4 py-2 bg-softWhite border border-navy/10 rounded-lg focus:ring-2 focus:ring-burgundy outline-none"
                                    placeholder="https://images.unsplash.com/..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-navy/70">Caption (Optional)</label>
                                <textarea
                                    value={formData.caption}
                                    onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                                    className="w-full px-4 py-2 bg-softWhite border border-navy/10 rounded-lg focus:ring-2 focus:ring-burgundy outline-none h-20"
                                />
                            </div>

                            <div className="pt-4">
                                <Button type="submit" disabled={loading} className="w-full flex items-center justify-center space-x-2">
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    <span>Upload to Gallery</span>
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Add Album Modal */}
            {isAlbumModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-navy/60 backdrop-blur-sm" onClick={() => setIsAlbumModalOpen(false)}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-4 sm:p-6 border-b border-navy/5 flex items-center justify-between bg-navy text-softWhite">
                            <div className="flex items-center space-x-3">
                                <Plus size={20} className="text-gold" />
                                <h3 className="text-lg sm:text-xl font-serif font-bold">Create New Album</h3>
                            </div>
                            <button onClick={() => setIsAlbumModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleAlbumSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-navy/70">Album Title</label>
                                <input
                                    required
                                    type="text"
                                    value={albumFormData.title}
                                    onChange={(e) => setAlbumFormData({ ...albumFormData, title: e.target.value })}
                                    className="w-full px-4 py-2 bg-softWhite border border-navy/10 rounded-lg focus:ring-2 focus:ring-burgundy outline-none"
                                    placeholder="e.g. Easter 2024"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-navy/70">Description</label>
                                <textarea
                                    value={albumFormData.description}
                                    onChange={(e) => setAlbumFormData({ ...albumFormData, description: e.target.value })}
                                    className="w-full px-4 py-2 bg-softWhite border border-navy/10 rounded-lg focus:ring-2 focus:ring-burgundy outline-none h-20"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-navy/70">Cover Image URL</label>
                                <input
                                    type="text"
                                    value={albumFormData.cover_image_url}
                                    onChange={(e) => setAlbumFormData({ ...albumFormData, cover_image_url: e.target.value })}
                                    className="w-full px-4 py-2 bg-softWhite border border-navy/10 rounded-lg focus:ring-2 focus:ring-burgundy outline-none"
                                />
                            </div>

                            <div className="pt-4">
                                <Button type="submit" disabled={loading} className="w-full flex items-center justify-center space-x-2">
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    <span>Create Album</span>
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
