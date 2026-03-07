import { useEffect, useState } from 'react';
import { Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../services/api';

export function AdminSettingsPage() {
    const [configs, setConfigs] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [activeTab, setActiveTab] = useState<'home' | 'general' | 'backgrounds'>('general');

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            const res = await api.get('/config');
            setConfigs(res.data);
        } catch (err) {
            console.error('Failed to fetch configs', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (key: string, value: any) => {
        setSaving(true);
        setMessage(null);
        try {
            await api.post('/config', { key, value });
            setMessage({ type: 'success', text: `Successfully updated ${key}` });
            fetchConfigs();
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-burgundy" /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-serif font-bold text-navy">Site Configuration</h2>
                {message && (
                    <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                        <span>{message.text}</span>
                    </div>
                )}
            </div>

            <div className="flex space-x-2 border-b border-navy/10 pb-2">
                <button
                    onClick={() => setActiveTab('general')}
                    className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${activeTab === 'general' ? 'bg-navy text-white' : 'text-navy/60 hover:text-navy hover:bg-navy/5'}`}
                >
                    General & Contact
                </button>
                <button
                    onClick={() => setActiveTab('home')}
                    className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${activeTab === 'home' ? 'bg-navy text-white' : 'text-navy/60 hover:text-navy hover:bg-navy/5'}`}
                >
                    Home Page
                </button>
                <button
                    onClick={() => setActiveTab('backgrounds')}
                    className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${activeTab === 'backgrounds' ? 'bg-navy text-white' : 'text-navy/60 hover:text-navy hover:bg-navy/5'}`}
                >
                    Page Backgrounds
                </button>
            </div>

            {activeTab === 'general' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <ConfigSection
                        title="About Page Summary"
                        description="General overview shown on the about page and home page preview."
                        onSave={(data) => handleUpdate('about_summary', data)}
                        saving={saving}
                        initialData={configs?.about_summary || { title: "", content: "" }}
                        fields={[
                            { key: 'title', label: 'Section Title', type: 'text' },
                            { key: 'content', label: 'Content Body', type: 'textarea' }
                        ]}
                    />

                    <ConfigSection
                        title="Contact Information"
                        description="Details shown in the footer and contact sections."
                        onSave={(data) => handleUpdate('contact_info', data)}
                        saving={saving}
                        initialData={configs?.contact_info || { email: "", phone: "", location: "" }}
                        fields={[
                            { key: 'email', label: 'Email Address', type: 'text' },
                            { key: 'phone', label: 'Phone Number', type: 'text' },
                            { key: 'location', label: 'Physical Location', type: 'text' }
                        ]}
                    />

                    <ConfigSection
                        title="Footer Text"
                        description="Information and branding displayed in the site footer."
                        onSave={(data) => handleUpdate('footer_content', data)}
                        saving={saving}
                        initialData={configs?.footer_content || { description: "", mass_times: "", copyright_text: "" }}
                        fields={[
                            { key: 'description', label: 'Brand Description', type: 'textarea' },
                            { key: 'mass_times', label: 'Meeting & Mass Times', type: 'textarea' },
                            { key: 'copyright_text', label: 'Copyright Notice', type: 'text' }
                        ]}
                    />
                </div>
            )}

            {activeTab === 'home' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <ConfigSection
                        title="Home Page Hero"
                        description="The main section users see when they land on the site. For background images, provide comma-separated URLs."
                        onSave={(data) => handleUpdate('hero_content', data)}
                        saving={saving}
                        initialData={configs?.hero_content || { title: "", subtitle: "", button_text: "", images: "", interval: "5000" }}
                        fields={[
                            { key: 'title', label: 'Main Title', type: 'text' },
                            { key: 'subtitle', label: 'Subtitle/Tagline', type: 'textarea' },
                            { key: 'button_text', label: 'Call to Action Button', type: 'text' },
                            { key: 'images', label: 'Background Images (Comma-separated URLs)', type: 'textarea' },
                            { key: 'interval', label: 'Carousel Interval (ms)', type: 'text' }
                        ]}
                    />

                    <ConfigSection
                        title="Homepage Images"
                        description="Customize additional images across the landing page."
                        onSave={(data) => handleUpdate('homepage_images', data)}
                        saving={saving}
                        initialData={configs?.homepage_images || { about_image: "", prayer_bg: "" }}
                        fields={[
                            { key: 'about_image', label: 'About Section Image URL', type: 'text' },
                            { key: 'prayer_bg', label: 'Prayer Wall Background URL', type: 'text' }
                        ]}
                    />
                </div>
            )}

            {activeTab === 'backgrounds' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <ConfigSection
                        title="Public Page Backgrounds"
                        description="Provide image URLs to be used as header backgrounds for specific public pages. Leave empty to use the default solid color."
                        onSave={(data) => handleUpdate('page_backgrounds', data)}
                        saving={saving}
                        initialData={configs?.page_backgrounds || { about: "", events: "", blog: "", gallery: "", prayer_wall: "", get_involved: "" }}
                        fields={[
                            { key: 'about', label: 'About Page Background URL', type: 'image' },
                            { key: 'events', label: 'Events Page Background URL', type: 'image' },
                            { key: 'blog', label: 'Blog Page Background URL', type: 'image' },
                            { key: 'gallery', label: 'Gallery Page Background URL', type: 'image' },
                            { key: 'prayer_wall', label: 'Prayer Wall Page Background URL', type: 'image' },
                            { key: 'get_involved', label: 'Get Involved Page Background URL', type: 'image' }
                        ]}
                    />
                </div>
            )}
        </div>
    );
}

interface ConfigSectionProps {
    title: string;
    description: string;
    fields: { key: string, label: string, type: 'text' | 'textarea' | 'image' }[];
    initialData: any;
    onSave: (data: any) => void;
    saving: boolean;
}

function ConfigSection({ title, description, fields, initialData, onSave, saving }: ConfigSectionProps) {
    const [formData, setFormData] = useState(initialData);

    useEffect(() => {
        setFormData(initialData);
    }, [initialData]);

    const handleChange = (key: string, value: string) => {
        setFormData((prev: any) => ({ ...prev, [key]: value }));
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-navy/5 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-navy/5 bg-navy/[0.02]">
                <h3 className="text-base sm:text-lg font-bold text-navy">{title}</h3>
                <p className="text-xs sm:text-sm text-navy/50">{description}</p>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
                {fields.map((field) => (
                    <div key={field.key} className="space-y-1">
                        <label className="text-sm font-medium text-navy/70">{field.label}</label>
                        {field.type === 'textarea' ? (
                            <textarea
                                value={formData[field.key] || ''}
                                onChange={(e) => handleChange(field.key, e.target.value)}
                                className="w-full px-4 py-2 bg-softWhite border border-navy/10 rounded-lg focus:ring-2 focus:ring-burgundy focus:border-transparent outline-none transition-all h-24"
                            />
                        ) : field.type === 'image' ? (
                            <div className="flex flex-col sm:flex-row gap-4">
                                <input
                                    type="text"
                                    value={formData[field.key] || ''}
                                    onChange={(e) => handleChange(field.key, e.target.value)}
                                    placeholder="Enter image URL..."
                                    className="flex-1 px-4 py-2 bg-softWhite border border-navy/10 rounded-lg focus:ring-2 focus:ring-burgundy focus:border-transparent outline-none transition-all"
                                />
                                {formData[field.key] && (
                                    <div className="w-full sm:w-48 h-24 sm:h-auto rounded border border-navy/10 overflow-hidden flex-shrink-0 bg-navy/5 flex items-center justify-center">
                                        <img
                                            src={formData[field.key]}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                                (e.target as HTMLImageElement).parentElement!.classList.add('flex');
                                                const span = document.createElement('span');
                                                span.className = 'text-xs text-navy/40 font-medium px-2 text-center';
                                                span.innerText = 'Invalid Image URL';
                                                (e.target as HTMLImageElement).parentElement!.appendChild(span);
                                            }}
                                            onLoad={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'block';
                                                const span = (e.target as HTMLImageElement).parentElement!.querySelector('span');
                                                if (span) span.remove();
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <input
                                type="text"
                                value={formData[field.key] || ''}
                                onChange={(e) => handleChange(field.key, e.target.value)}
                                className="w-full px-4 py-2 bg-softWhite border border-navy/10 rounded-lg focus:ring-2 focus:ring-burgundy focus:border-transparent outline-none transition-all"
                            />
                        )}
                    </div>
                ))}
                <div className="flex justify-end pt-4">
                    <button
                        onClick={() => onSave(formData)}
                        disabled={saving}
                        className="bg-burgundy text-gold px-6 py-2 rounded-lg font-medium hover:bg-burgundy-light transition-all flex items-center space-x-2 disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        <span>Save Changes</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
