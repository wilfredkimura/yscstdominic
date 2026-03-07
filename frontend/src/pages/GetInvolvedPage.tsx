
import { useState, useEffect } from 'react';
import api from '../services/api';

export function GetInvolvedPage() {
    const [config, setConfig] = useState<any>(null);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await api.get('/config');
                setConfig(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchConfig();
    }, []);

    return (
        <div className="w-full bg-cream min-h-screen pb-20">
            <div className="bg-navy text-softWhite py-12 md:py-16 px-4 text-center relative overflow-hidden">
                {config?.page_backgrounds?.get_involved && (
                    <div className="absolute inset-0 opacity-20">
                        <img src={config.page_backgrounds.get_involved} alt="" className="w-full h-full object-cover" />
                    </div>
                )}
                <div className="relative z-10">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-softWhite mb-4">Get Involved</h1>
                    <p className="text-lg text-cream-dark/90 leading-relaxed mb-6">
                        This page is currently under construction. Please check back soon to learn more about how you can support our mission.
                    </p>
                </div>
            </div>
        </div>
    );
}
