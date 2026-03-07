import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Heart, ArrowRight, Church, Clock, MapPin } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Link } from 'react-router-dom';
import api from '../services/api';

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  }
};

const DEFAULT_EVENT_IMAGE = 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&h=600&fit=crop';
const DEFAULT_BLOG_IMAGE = 'https://images.unsplash.com/photo-1490730141103-6ac27d020028?w=800&h=600&fit=crop';

function ImageWithFallback({ src, alt, fallback, className }: { src: string, alt: string, fallback: string, className?: string }) {
  const [error, setError] = useState(false);
  return (
    <img
      src={error ? fallback : (src || fallback)}
      alt={alt}
      onError={() => setError(true)}
      className={className}
    />
  );
}

export function HomePage() {
  const [config, setConfig] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [recentPosts, setRecentBlogPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.get('/config');
        setConfig(res.data);
      } catch (err) {
        console.error('Failed to fetch config', err);
      }
    };
    fetchConfig();
  }, []);

  const heroImages = config?.hero_content?.images
    ? config.hero_content.images.split(',').map((img: string) => img.trim()).filter(Boolean)
    : ["https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1600&h=900&fit=crop"];

  const interval = parseInt(config?.hero_content?.interval) || 5000;

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, interval);
    return () => clearInterval(timer);
  }, [heroImages.length, interval]);

  useEffect(() => {
    const fetchHomeContent = async () => {
      try {
        const [eventsRes, blogRes] = await Promise.all([
          api.get('/events?limit=3'),
          api.get('/blog?limit=3')
        ]);
        setUpcomingEvents(eventsRes.data);
        setRecentBlogPosts(blogRes.data);
      } catch (err) {
        console.error('Failed to fetch home content', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeContent();
  }, []);

  const heroContent = config?.hero_content || {
    title: "Youth Serving Christ",
    subtitle: "A community of young believers growing in faith, serving with love, and walking together in the light of the Gospel.",
    button_text: "Join Our Community"
  };

  return (
    <div className="w-full text-navy">
      {loading && (
        <div className="fixed inset-0 z-[100] bg-navy/20 backdrop-blur-sm flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 z-0"
          >
            <ImageWithFallback
              src={heroImages[currentImageIndex]}
              alt="Background"
              fallback="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1600&h=900&fit=crop"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-navy/60 via-navy/40 to-navy/80" />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="inline-block bg-gold/20 backdrop-blur-md text-gold-light border border-gold/30 px-6 py-2 rounded-full text-sm font-bold tracking-[0.2em] mb-6 uppercase">
              Welcome to St. Dominic's Youth
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-softWhite mb-8 leading-[1.1]">
              {heroContent.title}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-cream-dark/90 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              {heroContent.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button as="link" to="/signup?mode=signup" size="lg" className="bg-gold text-navy hover:bg-gold-light font-bold px-8 py-6 rounded-xl shadow-xl hover:shadow-gold/20 transition-all border-0 w-full sm:w-auto">
                {heroContent.button_text}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>


      {/* About Brief */}
      <section className="py-16 md:py-24 px-4 bg-cream">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl relative z-10">
              <ImageWithFallback
                src={config?.homepage_images?.about_image || "https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=800&h=1000&fit=crop"}
                alt="Community"
                fallback="https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=800&h=1000&fit=crop"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-gold rounded-3xl -z-0 opacity-20 blur-2xl animate-pulse" />
            <div className="absolute top-1/2 -left-8 -translate-y-1/2 bg-softWhite p-8 rounded-2xl shadow-xl z-20 hidden md:block max-w-[240px] border border-cream-dark/50">
              <div className="flex items-center gap-4 text-burgundy mb-4">
                <Church size={32} />
                <span className="font-serif font-bold text-2xl">Faith first</span>
              </div>
              <p className="text-sm text-navy/60 leading-relaxed font-medium">
                Rooted in Catholic traditions, we strive to bring the Gospel to life.
              </p>
            </div>
          </motion.div>

          <div className="space-y-8">
            <div>
              <span className="text-burgundy font-bold tracking-[0.2em] uppercase text-sm mb-4 block">Our Identity</span>
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-serif font-bold text-navy leading-tight">
                Walking Together <br /> in <span className="text-burgundy">Faith & Service</span>
              </h2>
            </div>
            <p className="text-lg text-navy/60 leading-relaxed font-medium">
              The Catholic Youth Serving Christ at St. Dominic's is more than just a group; we are a family. Our mission is to empower young people to become disciples of Christ through prayer, community involvement, and spiritual formation.
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { title: "Service", desc: "Serving our parish and local community." },
                { title: "Fellowship", desc: "Building lifelong friendships in Christ." }
              ].map((item, i) => (
                <div key={i} className="bg-softWhite p-6 rounded-2xl border border-cream-dark/50 hover:border-burgundy/20 transition-colors shadow-sm">
                  <h4 className="font-serif font-bold text-xl text-navy mb-3">{item.title}</h4>
                  <p className="text-sm text-navy/60 font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
            <Button as="link" to="/about" variant="secondary" size="lg" className="rounded-xl px-10 hover:shadow-lg transition-all group">
              Learn More About Us <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 md:py-24 px-4 bg-softWhite">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12 md:mb-16">
            <div>
              <span className="text-burgundy font-bold tracking-[0.2em] uppercase text-sm mb-4 block">Calendar</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-navy">Upcoming Activities</h2>
            </div>
            <Link
              to="/events"
              className="hidden sm:flex items-center text-burgundy hover:text-burgundy-light font-bold transition-colors group text-lg"
            >
              View All Calendar <ArrowRight size={18} className="ml-2 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {upcomingEvents.length > 0 ? upcomingEvents.map((event) => {
              const dateObj = new Date(event.event_date || event.date);
              const month = dateObj.toLocaleString('default', { month: 'short' });
              const day = dateObj.getDate();
              return (
                <motion.div key={event.id} variants={fadeUp}>
                  <Card hover className="h-full flex flex-col group border-0 shadow-lg hover:shadow-2xl transition-all rounded-3xl overflow-hidden">
                    <div className="relative h-60 overflow-hidden">
                      <ImageWithFallback
                        src={event.image_url || event.imageUrl || DEFAULT_EVENT_IMAGE}
                        alt={event.title}
                        fallback={DEFAULT_EVENT_IMAGE}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent opacity-60" />
                      <div className="absolute top-6 left-6 bg-softWhite/90 backdrop-blur-md text-navy rounded-2xl p-2.5 text-center shadow-xl min-w-[70px] border border-white/50">
                        <span className="block text-xs font-bold uppercase text-burgundy tracking-widest">{month}</span>
                        <span className="block text-3xl font-serif font-bold leading-none mt-1">{day}</span>
                      </div>
                      {event.is_featured && (
                        <div className="absolute top-6 right-6 bg-gold text-navy text-[11px] font-black px-4 py-1.5 rounded-full shadow-xl border border-white/30 backdrop-blur-sm">
                          FEATURED
                        </div>
                      )}
                    </div>
                    <div className="p-8 flex flex-col flex-grow">
                      <div className="flex items-center gap-2 text-burgundy/60 mb-4 font-bold text-xs uppercase tracking-widest">
                        <Calendar size={14} /> {event.category || 'Event'}
                      </div>
                      <h3 className="text-2xl font-serif font-bold text-navy mb-4 group-hover:text-burgundy transition-colors line-clamp-2 leading-snug">
                        {event.title}
                      </h3>
                      <p className="text-navy/60 text-[15px] mb-6 flex-grow line-clamp-3 leading-relaxed font-medium">
                        {event.description}
                      </p>
                      <div className="pt-6 border-t border-cream-dark text-sm text-navy/80 font-bold flex items-center justify-between">
                        <span className="flex items-center gap-2"><MapPin size={16} className="text-burgundy" /> {event.location}</span>
                        <span className="text-burgundy/40 underline underline-offset-4">Learn More</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            }) : (
              <div className="col-span-3 py-12 text-center text-navy/40 font-serif italic text-lg">
                No upcoming events found. Check back soon!
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Recent Reflections */}
      <section className="py-16 md:py-24 px-4 bg-cream">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12 md:mb-16">
            <div>
              <span className="text-burgundy font-bold tracking-[0.2em] uppercase text-sm mb-4 block">Spiritual Growth</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-navy">Latest Reflections</h2>
            </div>
            <Link
              to="/blog"
              className="hidden sm:flex items-center text-burgundy hover:text-burgundy-light font-bold transition-colors group text-lg"
            >
              Read the Blog <ArrowRight size={18} className="ml-2 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {recentPosts.length > 0 ? recentPosts.map((post) => (
              <motion.div key={post.id} variants={fadeUp}>
                <Link to={`/blog/${post.slug}`} className="block h-full group">
                  <Card hover className="h-full flex flex-col border-0 shadow-lg hover:shadow-2xl transition-all rounded-3xl overflow-hidden bg-softWhite">
                    <div className="relative h-64 overflow-hidden">
                      <ImageWithFallback
                        src={post.image_url || post.imageUrl || DEFAULT_BLOG_IMAGE}
                        alt={post.title}
                        fallback={DEFAULT_BLOG_IMAGE}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-navy/20 group-hover:bg-transparent transition-colors" />
                      <div className="absolute top-6 right-6 bg-navy/80 backdrop-blur-md text-gold text-xs font-black px-4 py-1.5 rounded-full shadow-xl border border-white/10">
                        {post.category}
                      </div>
                      {post.is_featured && (
                        <div className="absolute top-6 left-6 bg-gold text-navy text-[11px] font-black px-4 py-1.5 rounded-full shadow-xl border border-white/30 backdrop-blur-sm">
                          FEATURED
                        </div>
                      )}
                    </div>
                    <div className="p-8 flex flex-col flex-grow">
                      <div className="text-xs text-navy/40 mb-3 font-bold uppercase tracking-widest flex items-center gap-2">
                        <Clock size={14} />
                        {new Date(post.created_at || post.date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      <h3 className="text-2xl font-serif font-bold text-navy mb-4 group-hover:text-burgundy transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-navy/60 text-[15px] line-clamp-3 mb-6 flex-grow leading-relaxed font-medium">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between pt-6 border-t border-cream-dark">
                        <div className="flex items-center text-sm font-bold text-navy">
                          <span className="w-8 h-8 rounded-full bg-burgundy/10 flex items-center justify-center text-burgundy mr-3 text-xs border border-burgundy/20">
                            {post.author ? post.author.charAt(0) : '?'}
                          </span>
                          {post.author || 'Anonymous'}
                        </div>
                        <ArrowRight size={18} className="text-burgundy/40 group-hover:text-burgundy group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            )) : (
              <div className="col-span-3 py-12 text-center text-navy/40 font-serif italic text-lg">
                No reflections found. Stay tuned for inspiration!
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Prayer Wall CTA */}
      <section className="py-16 md:py-28 px-4 relative overflow-hidden bg-navy">
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src={config?.homepage_images?.prayer_bg || "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1600&h=800&fit=crop"}
            alt="Prayer candles"
            fallback="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1600&h=800&fit=crop"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/80 to-transparent" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-left md:text-center mt-8 md:mt-0">
          <Heart className="w-12 h-12 md:w-16 md:h-16 text-gold mb-6 md:mb-8 md:mx-auto shadow-gold/20" />
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-serif font-bold mb-6 md:mb-8 text-softWhite leading-tight">
            How can we <span className="text-gold">pray</span> for you?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-cream-dark/80 mb-10 md:mb-12 max-w-2xl md:mx-auto leading-relaxed font-medium">
            "For where two or three are gathered in my name, I am there among
            them." <br className="hidden md:block" />
            Submit a prayer request and let us lift your intentions together.
          </p>
          <div className="flex flex-col sm:flex-row items-center lg:justify-center gap-6">
            <Button
              as="link"
              to="/prayer-wall"
              size="lg"
              className="bg-gold text-navy hover:bg-gold-light font-black px-12 py-7 rounded-2xl shadow-2xl hover:shadow-gold/30 transition-all border-0 w-full sm:w-auto text-lg"
            >
              Visit the Prayer Wall
            </Button>
            <Link to="/about" className="text-softWhite/70 hover:text-softWhite font-bold flex items-center gap-2 group transition-all underline-offset-8 hover:underline">
              Learn about our mission <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}