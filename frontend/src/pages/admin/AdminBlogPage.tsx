import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus,
    Search,
    Filter,
    Edit2,
    Trash2,
    Eye,
    Loader2,
    Calendar,
    User as UserIcon,
    Tag,
    X,
    MessageSquare,
    EyeOff,
    Pin,
    FileText,
    Save
} from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';

export function AdminBlogPage() {
    const [blogs, setBlogs] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<any>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [commentLoading, setCommentLoading] = useState(false);
    const [editingBlog, setEditingBlog] = useState<any>(null);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        category: '',
        image_url: '',
        author: '',
        is_featured: false
    });
    const [categoryFormData, setCategoryFormData] = useState({
        name: '',
        slug: ''
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [blogsRes, catsRes] = await Promise.all([
                api.get('/blog'),
                api.get('/blog/categories')
            ]);
            setBlogs(blogsRes.data);
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

    const fetchBlogs = async () => {
        try {
            const res = await api.get('/blog');
            setBlogs(res.data);
        } catch (err) {
            console.error('Failed to fetch blogs', err);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await api.get('/blog/categories');
            setCategories(res.data);
        } catch (err) {
            console.error('Failed to fetch categories', err);
        }
    };

    const handleOpenModal = (blog: any = null) => {
        if (blog) {
            setEditingBlog(blog);
            setFormData({
                title: blog.title,
                slug: blog.slug,
                excerpt: blog.excerpt,
                content: blog.content,
                category: blog.category,
                image_url: blog.image_url,
                author: blog.author,
                is_featured: blog.is_featured || false
            });
        } else {
            setEditingBlog(null);
            setFormData({
                title: '',
                slug: '',
                excerpt: '',
                content: '',
                category: categories[0]?.name || '',
                image_url: '',
                author: '',
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
            if (editingBlog) {
                await api.put(`/blog/${editingBlog.id}`, formData);
            } else {
                await api.post('/blog', formData);
            }
            setIsModalOpen(false);
            fetchBlogs();
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || 'Failed to save blog';
            alert(errorMsg);
            console.error('Failed to save blog', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCategorySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/blog/categories', categoryFormData);
            setIsCategoryModalOpen(false);
            setCategoryFormData({ name: '', slug: '' });
            fetchCategories();
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || 'Failed to create category';
            alert(errorMsg);
            console.error('Failed to create category', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenComments = async (blog: any) => {
        setSelectedPost(blog);
        setIsCommentModalOpen(true);
        setCommentLoading(true);
        try {
            const res = await api.get(`/comments/admin/all`); // Or specific /comments/post/:id if filtered by admin
            // Filtering on frontend for now or update backend to accept postId for admin
            const postComments = res.data.filter((c: any) => c.post_id === blog.id);
            setComments(postComments);
        } catch (err) {
            console.error('Failed to fetch comments', err);
        } finally {
            setCommentLoading(false);
        }
    };

    const handleToggleCommentStatus = async (commentId: number, currentStatus: string) => {
        const newStatus = currentStatus === 'visible' ? 'hidden' : 'visible';
        try {
            await api.patch(`/comments/${commentId}/status`, { status: newStatus });
            setComments(prev => prev.map(c => c.id === commentId ? { ...c, status: newStatus } : c));
        } catch (err) {
            console.error('Failed to toggle status', err);
        }
    };

    const handleTogglePin = async (commentId: number, currentPinned: boolean) => {
        try {
            await api.patch(`/comments/${commentId}/pin`, { is_pinned: !currentPinned });
            setComments(prev => prev.map(c => c.id === commentId ? { ...c, is_pinned: !currentPinned } : c));
        } catch (err) {
            console.error('Failed to toggle pin', err);
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        if (!window.confirm('Delete this comment permanentely?')) return;
        try {
            await api.delete(`/comments/${commentId}`);
            setComments(prev => prev.map(c => c.id === commentId ? { ...c, deleted_at: new Date() } : c).filter(c => !c.deleted_at));
            // Actually filter it out
            setComments(prev => prev.filter(c => c.id !== commentId));
        } catch (err) {
            console.error('Failed to delete comment', err);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        setLoading(true);
        try {
            await api.delete(`/blog/${id}`); // Assuming DELETE /blog/:id
            fetchBlogs();
        } catch (err) {
            console.error('Failed to delete blog', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredBlogs = Array.isArray(blogs) ? blogs.filter(blog =>
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.author.toLowerCase().includes(searchQuery.toLowerCase())
    ) : [];

    if (loading && !isModalOpen) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-burgundy" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-serif font-bold text-navy">Blog Management</h2>
                    <p className="text-sm text-navy/50">Create, edit, and publish spiritual reflections.</p>
                </div>
                <div className="flex space-x-3">
                    <Button onClick={() => setIsCategoryModalOpen(true)} variant="secondary" className="flex items-center space-x-2">
                        <Plus size={18} />
                        <span>Manage Categories</span>
                    </Button>
                    <Button onClick={() => handleOpenModal()} className="flex items-center space-x-2">
                        <Plus size={18} />
                        <span>New Post</span>
                    </Button>
                </div>
            </div>

            <div className="flex gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-navy/5">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/30" size={18} />
                    <input
                        type="text"
                        placeholder="Search posts or authors..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-softWhite border border-navy/10 rounded-lg focus:ring-2 focus:ring-burgundy outline-none"
                    />
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 border border-navy/10 rounded-lg text-navy/60 hover:bg-navy/5 transition-colors">
                    <Filter size={18} />
                    <span className="hidden sm:inline">Filters</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-navy/5 overflow-hidden overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-navy/[0.02] border-b border-navy/5">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold text-navy">Post Details</th>
                            <th className="px-6 py-4 text-sm font-semibold text-navy">Category</th>
                            <th className="px-6 py-4 text-sm font-semibold text-navy">Date Created</th>
                            <th className="px-6 py-4 text-sm font-semibold text-navy">Status</th>
                            <th className="px-6 py-4 text-sm font-semibold text-navy text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-navy/5">
                        {filteredBlogs.length > 0 ? filteredBlogs.map((blog) => (
                            <tr key={blog.id} className="hover:bg-navy/[0.01] transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 relative bg-navy/5">
                                            <img
                                                src={(blog.image_url && blog.image_url.trim() !== '') ? blog.image_url : 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=100&h=100&fit=crop'}
                                                alt=""
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=100&h=100&fit=crop';
                                                }}
                                            />
                                            {blog.is_featured && (
                                                <div className="absolute top-0 right-0 p-1 bg-gold text-white rounded-bl-lg">
                                                    <div className="w-2 h-2 rounded-full bg-white shadow-sm" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <p className="font-medium text-navy line-clamp-1">{blog.title}</p>
                                                {blog.is_featured && (
                                                    <span className="text-[10px] uppercase font-bold text-gold bg-gold/5 px-1.5 py-0.5 rounded border border-gold/20">Featured</span>
                                                )}
                                            </div>
                                            <div className="flex items-center text-xs text-navy/40">
                                                <UserIcon size={12} className="mr-1" />
                                                {blog.author}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2 py-1 bg-burgundy/5 text-burgundy text-xs font-medium rounded-full">
                                        <Tag size={12} className="mr-1" />
                                        {blog.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-navy/60">
                                    <div className="flex items-center">
                                        <Calendar size={14} className="mr-2 opacity-50" />
                                        {new Date(blog.created_at || blog.date).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Published
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                        <button
                                            onClick={() => handleOpenComments(blog)}
                                            className="p-2 text-navy/40 hover:text-burgundy hover:bg-burgundy/5 rounded-lg transition-colors"
                                            title="Moderate Comments"
                                        >
                                            <MessageSquare size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleOpenModal(blog)}
                                            className="p-2 text-navy/40 hover:text-burgundy hover:bg-burgundy/5 rounded-lg transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <Link
                                            to={`/blog/${blog.slug}`}
                                            target="_blank"
                                            className="p-2 text-navy/40 hover:text-navy hover:bg-navy/5 rounded-lg transition-colors"
                                        >
                                            <Eye size={16} />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(blog.id)}
                                            className="p-2 text-navy/40 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-navy/40 font-serif italic text-lg">
                                    No blog posts found. Time to reflect and write!
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
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-4 sm:p-6 border-b border-navy/5 flex items-center justify-between bg-navy text-softWhite">
                            <div className="flex items-center space-x-3">
                                <FileText size={20} className="text-gold" />
                                <h3 className="text-lg sm:text-xl font-serif font-bold truncate">{editingBlog ? 'Edit Post' : 'Create New Post'}</h3>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-navy/70">Post Title</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.title}
                                        onChange={handleTitleChange}
                                        className="w-full px-4 py-2 bg-softWhite border border-navy/10 rounded-lg focus:ring-2 focus:ring-burgundy outline-none"
                                        placeholder="Enter a compelling title"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-navy/70">Author Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.author}
                                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                        className="w-full px-4 py-2 bg-softWhite border border-navy/10 rounded-lg focus:ring-2 focus:ring-burgundy outline-none"
                                        placeholder="e.g. Fr. Dominic"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-navy/70">Category</label>
                                    <select
                                        required
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
                                <div className="space-y-2 flex items-center h-full pt-6">
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
                                        <span className="text-sm font-medium text-navy/70">Featured Post</span>
                                    </label>
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
                                <p className="text-[10px] text-navy/40 mt-1 italic">
                                    Tip: Use direct image links (ending in .jpg, .png) or Unsplash/Cloudinary URLs. Google search results links will not work.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-navy/70">Excerpt (Short summary)</label>
                                <textarea
                                    required
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                    className="w-full px-4 py-2 bg-softWhite border border-navy/10 rounded-lg focus:ring-2 focus:ring-burgundy outline-none h-20"
                                    placeholder="Sum up the post in one or two sentences..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-navy/70">Post Content (Rich Text/Markdown)</label>
                                <textarea
                                    required
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full px-4 py-2 bg-softWhite border border-navy/10 rounded-lg focus:ring-2 focus:ring-burgundy outline-none h-64"
                                    placeholder="Write your reflection here..."
                                />
                            </div>

                            <div className="pt-4 flex justify-end space-x-3">
                                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading} className="flex items-center space-x-2">
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} className="hidden" />}
                                    <span>{editingBlog ? 'Update Post' : 'Publish Post'}</span>
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
                                            placeholder="e.g. Life Updates"
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
                                                        await api.delete(`/blog/categories/${cat.id}`);
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
            {/* Comment Moderation Modal */}
            {isCommentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-navy/60 backdrop-blur-sm" onClick={() => setIsCommentModalOpen(false)}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-navy/5 flex items-center justify-between bg-navy text-softWhite">
                            <div className="flex items-center space-x-3">
                                <MessageSquare size={20} className="text-gold" />
                                <h3 className="text-xl font-serif font-bold truncate max-w-[400px]">Comments: {selectedPost?.title}</h3>
                            </div>
                            <button onClick={() => setIsCommentModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                            {commentLoading ? (
                                <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-burgundy" /></div>
                            ) : comments.length > 0 ? (
                                <div className="space-y-4">
                                    {comments.map((comment) => (
                                        <div key={comment.id} className={`p-3 sm:p-4 rounded-xl border ${comment.status === 'hidden' ? 'bg-navy/5 border-navy/10 opacity-60' : 'bg-white border-navy/5 shadow-sm'}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex flex-col sm:flex-row sm:items-center">
                                                    <span className="font-bold text-navy text-sm sm:text-base">{comment.author_name}</span>
                                                    <span className="text-[9px] sm:text-[10px] text-navy/40 sm:ml-2">{new Date(comment.created_at).toLocaleString()}</span>
                                                </div>
                                                <div className="flex items-center space-x-0.5 sm:space-x-1">
                                                    <button
                                                        onClick={() => handleTogglePin(comment.id, comment.is_pinned)}
                                                        className={`p-1.5 rounded-lg transition-colors ${comment.is_pinned ? 'text-gold bg-gold/10' : 'text-navy/30 hover:bg-gold/5 hover:text-gold'}`}
                                                        title={comment.is_pinned ? 'Unpin Reflection' : 'Pin Reflection'}
                                                    >
                                                        <Pin size={16} fill={comment.is_pinned ? "currentColor" : "none"} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleCommentStatus(comment.id, comment.status)}
                                                        className={`p-1.5 rounded-lg transition-colors ${comment.status === 'hidden' ? 'text-navy bg-navy/10' : 'text-navy/30 hover:bg-navy/5 hover:text-navy'}`}
                                                        title={comment.status === 'hidden' ? 'Make Visible' : 'Hide Comment'}
                                                    >
                                                        {comment.status === 'hidden' ? <Eye size={16} /> : <EyeOff size={16} />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteComment(comment.id)}
                                                        className="p-1.5 rounded-lg text-navy/30 hover:bg-red-50 hover:text-red-600 transition-colors"
                                                        title="Delete Permanently"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-sm text-navy/80 whitespace-pre-wrap">{comment.content}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 text-navy/30 italic font-serif">
                                    No reflections have been shared on this post yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
