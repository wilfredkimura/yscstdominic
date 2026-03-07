import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Loader2,
    Calendar as CalendarIcon,
    MapPin,
    X,
    Save,
    Clock,
    Users,
    Download
} from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';

export function AdminEventsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<any>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [categoryFormData, setCategoryFormData] = useState({ name: '', slug: '' });

    // RSVP State
    const [selectedRsvpEvent, setSelectedRsvpEvent] = useState<any>(null);
    const [rsvps, setRsvps] = useState<any[]>([]);
    const [loadingRsvps, setLoadingRsvps] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        date: '',
        location: '',
        description: '',
        category: 'Youth Mass',
        image_url: '',
        is_featured: false
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [eventsRes, catsRes] = await Promise.all([
                api.get('/events'),
                api.get('/events/categories')
            ]);
            setEvents(eventsRes.data);
            setCategories(catsRes.data);
            if (catsRes.data.length > 0) {
                setFormData(prev => ({ ...prev, category: catsRes.data[0].name }));
            }
        } catch (err) {
            console.error('Failed to fetch initial data', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchEvents = async () => {
        try {
            const res = await api.get('/events');
            setEvents(res.data);
        } catch (err) {
            console.error('Failed to fetch events', err);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await api.get('/events/categories');
            setCategories(res.data);
        } catch (err) {
            console.error('Failed to fetch categories', err);
        }
    };

    const handleOpenModal = (event: any = null) => {
        if (event) {
            setEditingEvent(event);
            setFormData({
                title: event.title,
                slug: event.slug || '',
                date: (event.event_date || event.date) ? new Date(event.event_date || event.date).toISOString().split('T')[0] : '',
                location: event.location,
                description: event.description,
                category: event.category,
                image_url: event.image_url,
                is_featured: event.is_featured || false
            });
        } else {
            setEditingEvent(null);
            setFormData({
                title: '',
                slug: '',
                date: '',
                location: '',
                description: '',
                category: categories[0]?.name || '',
                image_url: '',
                is_featured: false
            });
        }
        setIsModalOpen(true);
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        setFormData(prev => ({ ...prev, title, slug }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingEvent) {
                await api.put(`/events/${editingEvent.id}`, formData);
            } else {
                await api.post('/events', formData);
            }
            setIsModalOpen(false);
            fetchEvents();
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || 'Failed to save event';
            alert(errorMsg);
            console.error('Failed to save event', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCategorySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/events/categories', categoryFormData);
            setIsCategoryModalOpen(false);
            setCategoryFormData({ name: '', slug: '' });
            fetchCategories();
            fetchEvents(); // optional refresh 
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || 'Failed to create category';
            alert(errorMsg);
            console.error('Failed to create category', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenRsvps = async (event: any) => {
        setSelectedRsvpEvent(event);
        setLoadingRsvps(true);
        try {
            const res = await api.get(`/events/${event.id}/rsvps`);
            setRsvps(res.data);
        } catch (err) {
            console.error('Failed to fetch RSVPs', err);
        } finally {
            setLoadingRsvps(false);
        }
    };

    const handleDownloadCsv = () => {
        if (!selectedRsvpEvent || rsvps.length === 0) return;

        const headers = ['Name', 'Phone Number', 'Date Registered'];
        const csvContent = [
            headers.join(','),
            ...rsvps.map(rsvp => [
                `"${rsvp.name}"`,
                `"${rsvp.phone_number}"`,
                `"${new Date(rsvp.created_at).toLocaleString()}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `attendees_${selectedRsvpEvent.title.toLowerCase().replace(/ /g, '_')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this event?')) return;
        setLoading(true);
        try {
            await api.delete(`/events/${id}`);
            fetchEvents();
        } catch (err) {
            console.error('Failed to delete event', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredEvents = Array.isArray(events) ? events.filter(e =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.location.toLowerCase().includes(searchQuery.toLowerCase())
    ) : [];

    if (loading && !isModalOpen) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-burgundy" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-serif font-bold text-navy">Event Management</h2>
                    <p className="text-sm text-navy/50">Schedule and manage upcoming youth activities.</p>
                </div>
                <div className="flex space-x-3">
                    <Button onClick={() => setIsCategoryModalOpen(true)} variant="secondary" className="flex items-center space-x-2">
                        <Plus size={18} />
                        <span>Manage Categories</span>
                    </Button>
                    <Button onClick={() => handleOpenModal()} className="flex items-center space-x-2">
                        <Plus size={18} />
                        <span>New Event</span>
                    </Button>
                </div>
            </div>

            <div className="flex gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-navy/5">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/30" size={18} />
                    <input
                        type="text"
                        placeholder="Search events or locations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-softWhite border border-navy/10 rounded-lg focus:ring-2 focus:ring-burgundy outline-none"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-navy/5 overflow-hidden overflow-x-auto">
                <table className="w-full text-left min-w-[700px]">
                    <thead className="bg-navy/[0.02] border-b border-navy/5">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold text-navy">Event Details</th>
                            <th className="px-6 py-4 text-sm font-semibold text-navy">Location</th>
                            <th className="px-6 py-4 text-sm font-semibold text-navy">Date</th>
                            <th className="px-6 py-4 text-sm font-semibold text-navy text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-navy/5">
                        {filteredEvents.length > 0 ? filteredEvents.map((event) => (
                            <tr key={event.id} className="hover:bg-navy/[0.01] transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-navy/5 flex items-center justify-center relative">
                                            {event.image_url ? (
                                                <img src={event.image_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <CalendarIcon size={20} className="text-navy/20" />
                                            )}
                                            {event.is_featured && (
                                                <div className="absolute top-0 right-0 p-1 bg-gold text-white rounded-bl-lg">
                                                    <div className="w-2 h-2 rounded-full bg-white shadow-sm" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <p className="font-medium text-navy line-clamp-1">{event.title}</p>
                                                {event.is_featured && (
                                                    <span className="text-[10px] uppercase font-bold text-gold bg-gold/5 px-1.5 py-0.5 rounded border border-gold/20">Featured</span>
                                                )}
                                            </div>
                                            <span className="text-xs text-burgundy font-medium">{event.category}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-navy/60">
                                    <div className="flex items-center">
                                        <MapPin size={14} className="mr-2 opacity-50" />
                                        {event.location}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-navy/60">
                                    <div className="flex items-center">
                                        <Clock size={14} className="mr-2 opacity-50" />
                                        {new Date(event.event_date || event.date).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                        <button
                                            onClick={() => handleOpenRsvps(event)}
                                            className="p-2 text-navy/40 hover:text-burgundy hover:bg-burgundy/5 rounded-lg transition-colors"
                                            title="View Attendees"
                                        >
                                            <Users size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleOpenModal(event)}
                                            className="p-2 text-navy/40 hover:text-burgundy hover:bg-burgundy/5 rounded-lg transition-colors"
                                            title="Edit Event"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(event.id)}
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
                                    No upcoming events scheduled.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* View RSVPs Modal */}
            {selectedRsvpEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-navy/60 backdrop-blur-sm" onClick={() => setSelectedRsvpEvent(null)}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-4 sm:p-6 border-b border-navy/5 flex items-center justify-between bg-navy text-softWhite">
                            <div>
                                <h3 className="text-lg sm:text-xl font-serif font-bold truncate">Attendees</h3>
                                <p className="text-sm opacity-80">{selectedRsvpEvent.title}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                {rsvps.length > 0 && (
                                    <button
                                        onClick={handleDownloadCsv}
                                        className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-gold"
                                        title="Download CSV"
                                    >
                                        <Download size={18} />
                                        <span className="hidden sm:inline">Export CSV</span>
                                    </button>
                                )}
                                <button onClick={() => setSelectedRsvpEvent(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-cream">
                            {loadingRsvps ? (
                                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-burgundy" size={32} /></div>
                            ) : rsvps.length === 0 ? (
                                <div className="text-center py-12 text-navy/50 font-serif italic text-lg">
                                    No RSVPs found for this event yet.
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl shadow-sm border border-navy/5 overflow-hidden overflow-x-auto text-sm">
                                    <table className="w-full text-left min-w-[500px]">
                                        <thead className="bg-navy/[0.02] border-b border-navy/5">
                                            <tr>
                                                <th className="px-6 py-4 font-semibold text-navy">Name</th>
                                                <th className="px-6 py-4 font-semibold text-navy">Phone Number</th>
                                                <th className="px-6 py-4 font-semibold text-navy">Date Registered</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-navy/5">
                                            {rsvps.map(rsvp => (
                                                <tr key={rsvp.id} className="hover:bg-navy/[0.01] transition-colors">
                                                    <td className="px-6 py-4 font-medium text-navy">{rsvp.name}</td>
                                                    <td className="px-6 py-4 text-navy/60">{rsvp.phone_number}</td>
                                                    <td className="px-6 py-4 text-navy/60">{new Date(rsvp.created_at).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-cream border-t border-navy/5">
                                            <tr>
                                                <td colSpan={3} className="px-6 py-3 text-right font-medium text-navy">
                                                    Total Attendees: {rsvps.length}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Event Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-navy/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-4 sm:p-6 border-b border-navy/5 flex items-center justify-between bg-navy text-softWhite">
                            <h3 className="text-lg sm:text-xl font-serif font-bold truncate">{editingEvent ? 'Edit Event' : 'Schedule New Event'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-navy/70">Event Title</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.title}
                                    onChange={handleTitleChange}
                                    className="w-full px-4 py-2 bg-softWhite border border-navy/10 rounded-lg focus:ring-2 focus:ring-burgundy outline-none"
                                    placeholder="e.g. Youth Prayer Night"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-navy/70">Date</label>
                                    <input
                                        required
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full px-4 py-2 bg-softWhite border border-navy/10 rounded-lg focus:ring-2 focus:ring-burgundy outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-navy/70">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-2 bg-softWhite border border-navy/10 rounded-lg focus:ring-2 focus:ring-burgundy outline-none"
                                    >
                                        <option value="" disabled>Select a category</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={formData.is_featured}
                                                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                                            />
                                            <div className={`block w-10 h-6 rounded-full transition-colors ${formData.is_featured ? 'bg-burgundy' : 'bg-navy/20'}`}></div>
                                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.is_featured ? 'translate-x-4' : ''}`}></div>
                                        </div>
                                        <span className="text-sm font-medium text-navy/70">Featured Event (Display prominently on homepage)</span>
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-navy/70">Location</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-4 py-2 bg-softWhite border border-navy/10 rounded-lg focus:ring-2 focus:ring-burgundy outline-none"
                                    placeholder="e.g. Parish Hall"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-navy/70">Image URL</label>
                                <input
                                    type="text"
                                    value={formData.image_url}
                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                    className="w-full px-4 py-2 bg-softWhite border border-navy/10 rounded-lg focus:ring-2 focus:ring-burgundy outline-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-navy/70">Description</label>
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 bg-softWhite border border-navy/10 rounded-lg focus:ring-2 focus:ring-burgundy outline-none h-32"
                                />
                            </div>

                            <div className="pt-4 flex justify-end space-x-3">
                                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading} className="flex items-center space-x-2">
                                    <Save size={18} />
                                    <span>{editingEvent ? 'Update Event' : 'Publish Event'}</span>
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Category Management Modal */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-navy/60 backdrop-blur-sm" onClick={() => setIsCategoryModalOpen(false)}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-navy/5 flex items-center justify-between bg-navy text-softWhite">
                            <div className="flex items-center space-x-3">
                                <Plus size={20} className="text-gold" />
                                <h3 className="text-xl font-serif font-bold">Manage Categories</h3>
                            </div>
                            <button onClick={() => setIsCategoryModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <form onSubmit={handleCategorySubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-navy/70">New Category Name</label>
                                    <div className="flex space-x-2">
                                        <input
                                            required
                                            type="text"
                                            value={categoryFormData.name}
                                            onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                                            className="flex-1 px-4 py-2 bg-softWhite border border-navy/10 rounded-lg focus:ring-2 focus:ring-burgundy outline-none"
                                            placeholder="e.g. Workshop"
                                        />
                                        <Button type="submit" disabled={loading}>Add</Button>
                                    </div>
                                </div>
                            </form>

                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-navy/40 uppercase tracking-wider">Existing Categories</h4>
                                <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                                    {categories.map(cat => (
                                        <div key={cat.id} className="flex items-center justify-between p-3 bg-navy/[0.02] rounded-lg border border-navy/5">
                                            <span className="font-medium text-navy">{cat.name}</span>
                                            <button
                                                onClick={async () => {
                                                    if (window.confirm('Delete this category?')) {
                                                        await api.delete(`/events/categories/${cat.id}`);
                                                        fetchCategories();
                                                    }
                                                }}
                                                className="text-red-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
