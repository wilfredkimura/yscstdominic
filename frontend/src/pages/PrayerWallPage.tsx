import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Loader2 } from 'lucide-react';
import api from '../services/api';

export function PrayerWallPage() {
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
    <div className="w-full bg-cream min-h-screen">
      <div className="bg-navy text-softWhite py-12 md:py-16 px-4 text-center relative overflow-hidden">
        {config?.page_backgrounds?.prayer_wall && (
          <div className="absolute inset-0 opacity-20">
            <img src={config.page_backgrounds.prayer_wall} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block p-3 bg-burgundy rounded-full mb-6"
          >
            <Heart className="text-gold" size={32} />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4"
          >
            Community Prayer Wall
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-cream-dark/90 max-w-2xl mx-auto"
          >
            "When two or three are gathered in my name, I am there among them."
            Share your intentions and let us lift each other up in prayer.
          </motion.p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16 md:py-20 text-center">
        <div className="bg-white p-6 md:p-12 rounded-2xl shadow-sm border border-navy/5">
          <Loader2 className="animate-spin text-burgundy mx-auto mb-4" size={32} />
          <h2 className="text-xl md:text-2xl font-serif text-navy mb-2">Wall Under Construction</h2>
          <p className="text-navy/60">
            We are currently building our interactive prayer wall.
            Check back soon to share your requests and pray for others.
          </p>
        </div>
      </div>
    </div>
  );
}