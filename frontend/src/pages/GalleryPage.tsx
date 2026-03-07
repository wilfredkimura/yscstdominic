import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import api from '../services/api';

export function GalleryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const [galleryRes, configRes] = await Promise.all([
          api.get('/gallery'),
          api.get('/config')
        ]);
        setItems(galleryRes.data);
        setConfig(configRes.data);
      } catch (err) {
        console.error('Failed to fetch gallery', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  const categories = Array.from(new Set(items.map(item => item.category)));
  const filteredItems = selectedCategory
    ? items.filter(item => item.category === selectedCategory)
    : items;

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-cream"><Loader2 className="animate-spin text-burgundy" size={48} /></div>;

  return (
    <div className="w-full bg-cream min-h-screen pb-20">
      <div className="bg-navy text-softWhite py-12 md:py-16 px-4 text-center relative overflow-hidden">
        {config?.page_backgrounds?.gallery && (
          <div className="absolute inset-0 opacity-20">
            <img src={config.page_backgrounds.gallery} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="relative z-10">
          <motion.h1
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4">
            Photo Gallery
          </motion.h1>
          <motion.p
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              delay: 0.1
            }}
            className="text-lg text-cream-dark/90 max-w-2xl mx-auto">
            Capturing moments of faith, fellowship, and service.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-12">
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!selectedCategory ? 'bg-burgundy text-softWhite' : 'bg-softWhite text-navy border border-cream-dark'}`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === cat ? 'bg-burgundy text-softWhite' : 'bg-softWhite text-navy border border-cream-dark'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {filteredItems.length > 0 ? filteredItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="break-inside-avoid cursor-pointer overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-shadow group relative"
              onClick={() => setLightboxImage(item.image_url)}
            >
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-auto hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-sm font-medium">{item.title}</p>
              </div>
            </motion.div>
          )) : (
            <div className="col-span-full py-20 text-center text-navy/40 font-serif italic text-xl">
              The gallery is empty. More memories coming soon!
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-navy/95 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setLightboxImage(null)}
          >
            <button
              className="absolute top-6 right-6 text-softWhite/70 hover:text-softWhite transition-colors"
              onClick={() => setLightboxImage(null)}
            >
              <X size={32} />
            </button>
            <img
              src={lightboxImage}
              alt="Enlarged view"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}