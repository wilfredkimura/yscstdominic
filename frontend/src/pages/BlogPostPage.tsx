import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, Eye, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import api from '../services/api';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1600&h=900&fit=crop';

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/blog/${slug}`);
        setPost(res.data);

        // Increment view count
        api.post(`/blog/view/${slug}`).catch(err => console.error('Failed to increment views', err));
      } catch (err) {
        console.error('Failed to fetch blog post', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <Loader2 className="animate-spin text-burgundy" size={48} />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl font-serif font-bold text-navy mb-4">Post Not Found</h1>
        <p className="text-navy/70 mb-8">The reflection you are looking for does not exist.</p>
        <Button as="link" to="/blog">Back to Blog</Button>
      </div>
    );
  }

  return (
    <div className="w-full bg-cream min-h-screen pb-20">
      {/* Hero Image */}
      <div className="w-full h-[40vh] min-h-[300px] relative">
        <img
          src={
            imgError || !post.image_url || post.image_url.trim() === ''
              ? DEFAULT_IMAGE
              : post.image_url
          }
          alt={post.title}
          onError={() => {
            console.warn('Blog image failed to load, falling back to default:', post.image_url);
            setImgError(true);
          }}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-navy/50 mix-blend-multiply" />
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-16 md:-mt-32 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-softWhite rounded-2xl shadow-xl p-6 md:p-8 lg:p-12"
        >
          <Link
            to="/blog"
            className="inline-flex items-center text-sm font-medium text-burgundy hover:text-burgundy-light mb-8 transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" /> Back to all posts
          </Link>

          <div className="mb-6">
            <span className="inline-block bg-gold/20 text-gold-dark font-bold text-xs px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
              {post.category}
            </span>
            <h1 className="text-2xl md:text-3xl lg:text-5xl font-serif font-bold text-navy leading-tight mb-6">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-navy/60 pb-8 border-b border-cream-dark">
              <div className="flex items-center gap-2">
                <User size={16} />
                <span className="font-medium text-navy">{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>
                  {new Date(post.created_at || post.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Eye size={16} />
                <span>{post.views || 0} views</span>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <article className="prose prose-lg prose-navy max-w-none">
            {typeof post.content === 'string' ? (
              post.content.split('\n').map((para: string, idx: number) => (
                para ? <p key={idx} className="mb-6 text-navy/80 leading-relaxed text-lg">{para}</p> : <br key={idx} />
              ))
            ) : Array.isArray(post.content) ? (
              post.content.map((paragraph: string, idx: number) => (
                <p key={idx} className="mb-6 text-navy/80 leading-relaxed text-lg">{paragraph}</p>
              ))
            ) : (
              <p className="text-navy/80 leading-relaxed text-lg">{JSON.stringify(post.content)}</p>
            )}
          </article>
        </motion.div>
      </div>
    </div>
  );
}