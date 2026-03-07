import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Target, Heart } from 'lucide-react';
import { Card } from '../components/ui/Card';
import api from '../services/api';

const staggerContainer = {
  hidden: {
    opacity: 0
  },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};
const fadeUp = {
  hidden: {
    opacity: 0,
    y: 20
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};
export function AboutPage() {
  const [config, setConfig] = useState<any>(null);
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [configRes, leadersRes] = await Promise.all([
          api.get('/config'),
          api.get('/leaders')
        ]);
        setConfig(configRes.data);
        setLeaders(leadersRes.data);
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const aboutSummary = config?.about_summary || {
    title: "About YSC St. Dominic",
    content: "Forming young disciples to love Christ, serve the Church, and transform the world."
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-12 h-12 border-4 border-burgundy border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-cream min-h-screen pb-20">
      {/* Header */}
      <div className="bg-navy text-softWhite py-12 md:py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src={config?.page_backgrounds?.about || "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1600&h=400&fit=crop"}
            alt="Community"
            className="w-full h-full object-cover" />

        </div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.h1
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            className="text-3xl sm:text-4xl md:text-6xl font-serif font-bold mb-6">

            {aboutSummary.title}
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
            className="text-lg md:text-xl text-cream-dark/90 max-w-2xl mx-auto">

            {aboutSummary.content}
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-12 md:mt-16">
        {/* Mission & Vision */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-16 md:mb-24">
          <Card className="p-6 md:p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-burgundy/10 text-burgundy rounded-full flex items-center justify-center mb-6">
              <Target size={32} />
            </div>
            <h3 className="text-xl md:text-2xl font-serif font-bold text-navy mb-4">
              Our Mission
            </h3>
            <p className="text-navy/70 leading-relaxed text-sm md:text-base">
              To provide a vibrant, faithful community where young Catholics can
              encounter Jesus Christ, grow in their understanding of the
              Church's teachings, and be equipped for lifelong discipleship.
            </p>
          </Card>

          <Card className="p-6 md:p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-gold/10 text-gold-dark rounded-full flex items-center justify-center mb-6">
              <Heart size={32} />
            </div>
            <h3 className="text-xl md:text-2xl font-serif font-bold text-navy mb-4">
              Our Vision
            </h3>
            <p className="text-navy/70 leading-relaxed text-sm md:text-base">
              To see every young person in St. Theresa Kalimoni Parish actively
              engaged in their faith, participating in the sacraments, and
              serving their local community with the love of Christ.
            </p>
          </Card>

          <Card className="p-6 md:p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-navy/10 text-navy rounded-full flex items-center justify-center mb-6">
              <Users size={32} />
            </div>
            <h3 className="text-xl md:text-2xl font-serif font-bold text-navy mb-4">
              Our Core Values
            </h3>
            <ul className="text-navy/70 space-y-2 text-left list-disc list-inside inline-block text-sm md:text-base">
              <li>Eucharistic Devotion</li>
              <li>Authentic Fellowship</li>
              <li>Service to the Marginalized</li>
              <li>Continuous Formation</li>
            </ul>
          </Card>
        </div>

        {/* Leadership Team */}
        <div className="mb-12 md:mb-16 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-navy mb-4">
            Meet Our Leadership
          </h2>
          <p className="text-lg text-navy/70 max-w-2xl mx-auto">
            The dedicated core team serving the youth of St. Dominic.
          </p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{
            once: true
          }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">

          {leaders.length > 0 ? leaders.map((leader) =>
            <motion.div key={leader.id} variants={fadeUp}>
              <Card className="overflow-hidden h-full flex flex-col">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={leader.image_url || leader.imageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'}
                    alt={leader.name}
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="text-xl font-serif font-bold text-navy">
                    {leader.name}
                  </h3>
                  <p className="text-burgundy font-medium text-sm mb-4">
                    {leader.role}
                  </p>
                  <p className="text-navy/70 text-sm flex-grow">{leader.bio}</p>
                </div>
              </Card>
            </motion.div>
          ) : (
            <div className="col-span-full py-12 text-center text-navy/40 font-serif italic text-lg">
              Leadership team details coming soon.
            </div>
          )}
        </motion.div>
      </div>
    </div>);

}