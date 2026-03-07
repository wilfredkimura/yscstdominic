import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, FileText, Download } from 'lucide-react';
import { Card } from '../components/ui/Card';
import api from '../services/api';

export function ResourcesPage() {
    const [resources, setResources] = useState<any[]>([]);
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resRes, configRes] = await Promise.all([
                    api.get('/resources'),
                    api.get('/config')
                ]);
                setResources(resRes.data);
                setConfig(configRes.data);
            } catch (err) {
                console.error('Failed to fetch resources', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-cream"><Loader2 className="animate-spin text-burgundy" size={48} /></div>;

    // Group resources by category
    const groupedResources = resources.reduce((acc: any, resource: any) => {
        if (!acc[resource.category]) {
            acc[resource.category] = [];
        }
        acc[resource.category].push(resource);
        return acc;
    }, {});

    return (
        <div className="w-full bg-cream min-h-screen pb-20">
            <div className="bg-navy text-softWhite py-12 md:py-16 px-4 text-center relative overflow-hidden">
                {/* Fallback to default background if nothing provided in config */}
                {config?.page_backgrounds?.events && (
                    <div className="absolute inset-0 opacity-20">
                        <img src={config.page_backgrounds.events} alt="" className="w-full h-full object-cover" />
                    </div>
                )}
                <div className="relative z-10">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4">
                        Resources Library
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-cream-dark/90 max-w-2xl mx-auto">
                        A collection of forms, prayers, reflections, and other useful documents for our youth community.
                    </motion.p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 mt-12">
                {resources.length === 0 ? (
                    <div className="text-center py-12 text-navy/50 font-serif italic text-lg">
                        We are gathering documents for our library. Check back later!
                    </div>
                ) : (
                    <div className="space-y-12">
                        {Object.keys(groupedResources).sort().map((category, catIndex) => (
                            <motion.div
                                key={category}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: catIndex * 0.1 }}
                            >
                                <h2 className="text-2xl font-serif font-bold text-navy mb-6 pb-2 border-b border-navy/10">
                                    {category}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {groupedResources[category].map((resource: any, idx: number) => (
                                        <Card key={resource.id} className="flex flex-col h-full bg-softWhite border-t-4 border-t-burgundy p-6 transition-transform hover:-translate-y-1 hover:shadow-lg">
                                            <div className="flex items-start mb-4">
                                                <div className="p-3 bg-burgundy/5 text-burgundy rounded-xl mr-4 flex-shrink-0">
                                                    <FileText size={24} />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-navy text-lg line-clamp-2 leading-tight">
                                                        {resource.title}
                                                    </h3>
                                                    {resource.description && (
                                                        <p className="text-navy/60 text-sm mt-2 line-clamp-3">
                                                            {resource.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-auto pt-4 flex justify-between items-center border-t border-navy/5">
                                                <span className="text-xs text-navy/40 font-medium">
                                                    {new Date(resource.created_at).toLocaleDateString()}
                                                </span>
                                                <a
                                                    href={resource.file_url}
                                                    download
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center space-x-2 text-sm font-bold text-burgundy hover:text-gold transition-colors"
                                                >
                                                    <Download size={16} />
                                                    <span>Download</span>
                                                </a>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
