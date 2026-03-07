import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, Eye, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import api from '../services/api';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1600&h=900&fit=crop';

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentContent, setCommentContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        const res = await api.get(`/blog/${slug}`);
        setPost(res.data);

        // Increment view count
        api.post(`/blog/view/${slug}`).catch(err => console.error('Failed to increment views', err));

        if (res.data?.id) {
          const commRes = await api.get(`/comments/post/${res.data.id}`);
          setComments(commRes.data);
        }
      } catch (err) {
        console.error('Failed to fetch blog post or comments', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPostAndComments();
  }, [slug]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim() || !post?.id) return;

    setSubmitting(true);
    try {
      const res = await api.post(`/comments/post/${post.id}`, {
        content: commentContent,
        author_name: authorName || 'Anonymous'
      });
      setComments((prev) => [res.data, ...prev]);
      setCommentContent('');
      setAuthorName('');
    } catch (err) {
      console.error('Failed to post comment', err);
      alert('Failed to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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
          <article className="prose prose-lg prose-navy max-w-none mb-12">
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

          {/* Discussion Section */}
          <div className="pt-8 md:pt-12 border-t border-cream-dark">
            <h3 className="text-xl md:text-2xl font-serif font-bold text-navy mb-6 flex items-center gap-2">
              <MessageSquare size={24} className="text-burgundy" /> Discussion
            </h3>

            <form onSubmit={handleCommentSubmit} className="bg-cream p-6 rounded-xl mb-8">
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Your Name (Optional)"
                className="w-full p-3 rounded-lg border border-cream-dark bg-softWhite focus:ring-2 focus:ring-burgundy focus:border-transparent mb-4 text-navy"
              />
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                className="w-full p-4 rounded-lg border border-cream-dark bg-softWhite focus:ring-2 focus:ring-burgundy focus:border-transparent resize-none h-24 mb-4 text-navy"
                placeholder="Share your thoughts on this reflection..."
                required
              />
              <div className="flex justify-end">
                <Button type="submit" size="sm" disabled={submitting}>
                  {submitting ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            </form>

            <div className="space-y-6">
              {comments.length > 0 ? comments.map((comment) => (
                <div key={comment.id} className="flex gap-4 p-4 rounded-xl hover:bg-cream/50 transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 text-softWhite ${comment.is_pinned ? 'bg-gold shadow-lg ring-2 ring-gold/20' : 'bg-navy'}`}>
                    {(comment.author_name || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-navy">{comment.author_name || 'Anonymous'}</span>
                      {comment.is_pinned && <span className="text-[10px] bg-gold/20 text-gold-dark px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Pinned Reflection</span>}
                      <span className="text-xs text-navy/50">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-navy/80 text-sm leading-relaxed whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-center py-8 text-navy/40 font-serif italic text-lg border-2 border-dashed border-cream-dark rounded-2xl">
                  No reflections yet. Be the first to share your thoughts!
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}