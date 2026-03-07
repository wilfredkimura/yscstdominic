import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, FileText, Link as LinkIcon } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';

export function AdminResourcesPage() {
    const [resources, setResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        file_url: '',
        category: 'General'
    });

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            const res = await api.get('/resources');
            setResources(res.data);
        } catch (err) {
            console.error('Failed to fetch resources', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/resources', formData);
            setIsModalOpen(false);
            setFormData({ title: '', description: '', file_url: '', category: 'General' });
            fetchResources();
        } catch (err) {
            console.error('Failed to save resource', err);
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this resource?')) return;
        setLoading(true);
        try {
            await api.delete(`/resources/${id}`);
            fetchResources();
        } catch (err) {
            console.error('Failed to delete resource', err);
            setLoading(false);
        }
    };

    if (loading && !isModalOpen) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-burgundy" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-serif font-bold text-navy">Resource Library</h2>
                    <p className="text-sm text-navy/50">Upload and manage PDFs and forms for the youth.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2">
                    <Plus size={18} />
                    <span>Upload Resource</span>
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-navy/5 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-navy/[0.02] border-b border-navy/5">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold text-navy">Document Info</th>
                            <th className="px-6 py-4 text-sm font-semibold text-navy">Category</th>
                            <th className="px-6 py-4 text-sm font-semibold text-navy text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-navy/5">
                        {resources.length > 0 ? resources.map((resource) => (
                            <tr key={resource.id} className="hover:bg-navy/[0.01] transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-lg bg-burgundy/5 flex items-center justify-center text-burgundy flex-shrink-0">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-navy">{resource.title}</p>
                                            <p className="text-xs text-navy/50 truncate max-w-xs">{resource.description}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-navy/60">
                                    <span className="bg-navy/5 text-navy px-2.5 py-1 rounded text-xs font-medium">
                                        {resource.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex flex-col sm:flex-row items-center justify-end gap-2">
                                        <a
                                            href={resource.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-navy/40 hover:text-navy hover:bg-navy/5 rounded-lg transition-colors flex items-center"
                                            title="View File"
                                        >
                                            <LinkIcon size={16} />
                                        </a>
                                        <button
                                            onClick={() => handleDelete(resource.id)}
                                            className="p-2 text-navy/40 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete Resource"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={3} className="px-6 py-12 text-center text-navy/40 font-serif italic text-lg">
                                    No resources uploaded yet.
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
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 sm:p-8">
                        <h3 className="text-xl font-serif font-bold text-navy mb-6">Upload Document</h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-navy/70 mb-1">Title</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 bg-softWhite border border-navy/10 rounded-lg focus:ring-2 focus:ring-burgundy outline-none"
                                    placeholder="e.g. Youth Camp Permission Form"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-navy/70 mb-1">Description (Optional)</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 bg-softWhite border border-navy/10 rounded-lg focus:ring-2 focus:ring-burgundy outline-none h-24"
                                    placeholder="Brief description of this resource..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-navy/70 mb-1">Category</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2 bg-softWhite border border-navy/10 rounded-lg focus:ring-2 focus:ring-burgundy outline-none"
                                    placeholder="e.g. Forms, Prayers, Study Guides"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-navy/70 mb-1">File URL</label>
                                <input
                                    required
                                    type="url"
                                    value={formData.file_url}
                                    onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                                    className="w-full px-4 py-2 bg-softWhite border border-navy/10 rounded-lg focus:ring-2 focus:ring-burgundy outline-none"
                                    placeholder="Link to PDF (Google Drive, Cloudinary, etc)"
                                />
                                <p className="text-xs text-navy/50 mt-1">Paste the direct link to the document.</p>
                            </div>

                            <div className="flex gap-3 justify-end mt-8">
                                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    Upload Resource
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
