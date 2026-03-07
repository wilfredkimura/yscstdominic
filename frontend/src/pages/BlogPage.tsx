import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Eye, Loader2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import api from '../services/api';

export function BlogPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [blogsRes, catsRes, configRes] = await Promise.all([
          api.get('/blog'),
          api.get('/blog/categories'),
          api.get('/config')
        ]);
        setBlogs(blogsRes.data);
        setConfig(configRes.data);

        // Extract names and prefix with 'All'
        const dynamicCats = catsRes.data.map((c: any) => c.name);
        setCategories(['All', ...dynamicCats]);
      } catch (err) {
        console.error('Failed to fetch blog data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredPosts = activeCategory === 'All'
    ? blogs
    : blogs.filter((post) => post.category === activeCategory);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-cream"><Loader2 className="animate-spin text-burgundy" size={48} /></div>;

  return (
    <div className="w-full bg-cream min-h-screen pb-20">
      <div className="bg-navy text-softWhite py-12 md:py-16 px-4 text-center relative overflow-hidden">
        {config?.page_backgrounds?.blog && (
          <div className="absolute inset-0 opacity-20">
            <img src={config.page_backgrounds.blog} alt="" className="w-full h-full object-cover" />
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
            Reflections & News
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
            Stories, spiritual insights, and updates from the YSC community.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) =>
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === category ? 'bg-burgundy text-softWhite shadow-md' : 'bg-softWhite text-navy hover:bg-cream-dark border border-cream-dark'}`}>
              {category}
            </button>
          )}
        </div>

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.length > 0 ? filteredPosts.map((post, index) =>
            <motion.div
              key={post.id}
              initial={{
                opacity: 0,
                y: 20
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              transition={{
                delay: index * 0.1
              }}>
              <Link to={`/blog/${post.slug}`} className="block h-full">
                <Card hover className="h-full flex flex-col group">
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={post.image_url || 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=500&h=300&fit=crop'}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />

                    <div className="absolute top-4 right-4 bg-softWhite/90 backdrop-blur-sm text-burgundy font-bold text-xs px-3 py-1 rounded-full shadow-sm">
                      {post.category}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h2 className="text-xl font-serif font-bold text-navy mb-3 group-hover:text-burgundy transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-navy/70 text-sm line-clamp-3 mb-6 flex-grow">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs font-medium text-navy/60 pt-4 border-t border-cream-dark">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-navy/5 flex items-center justify-center text-navy font-bold">
                          {post.author?.charAt(0) || 'Y'}
                        </span>
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span>
                          {new Date(post.created_at || post.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye size={14} /> {post.views || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ) : (
            <div className="col-span-full py-20 text-center text-navy/40 font-serif italic text-xl">
              No stories told yet. Check back soon for reflections.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}