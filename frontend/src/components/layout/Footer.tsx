import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Church, MapPin, Clock, Mail } from 'lucide-react';
import api from '../../services/api';

export function Footer() {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.get('/config');
        setConfig(res.data);
      } catch (err) {
        console.error('Failed to fetch config for footer', err);
      }
    };
    fetchConfig();
  }, []);

  const description = config?.footer_content?.description || "Youth Serving Christ at St. Dominic Catholic Church, St. Theresa Kalimoni Parish. Fostering community, faith, and service among young Catholics.";
  const location = config?.contact_info?.location || "St. Theresa Kalimoni Parish\nJuja, Kenya";
  const massTimes = config?.footer_content?.mass_times || "Youth Mass: 2nd Sunday, 10:00 AM\nMeetings: Sundays after Mass";
  const email = config?.contact_info?.email || "hello@yscstdominic.org";
  const copyright = config?.footer_content?.copyright_text || "Youth Serving Christ — St. Dominic Catholic Church. All rights reserved.";


  return (
    <footer className="bg-navy text-softWhite pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand & About */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Church className="text-gold" size={28} />
              <span className="font-serif font-semibold text-2xl">
                YSC St. Dominic
              </span>
            </div>
            <p className="text-cream-dark/80 max-w-sm leading-relaxed whitespace-pre-wrap">
              {description}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-xl text-gold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                'Home',
                'About Us',
                'Upcoming Events',
                'Blog & Reflections',
                'Prayer Wall',
                'Gallery'].
                map((item) =>
                  <li key={item}>
                    <Link
                      to={
                        item === 'Home' ? '/' :
                          item === 'About Us' ? '/about' :
                            item === 'Upcoming Events' ? '/events' :
                              item === 'Blog & Reflections' ? '/blog' :
                                item === 'Prayer Wall' ? '/prayer-wall' :
                                  item === 'Gallery' ? '/gallery' :
                                    `/${item.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`
                      }
                      className="text-cream-dark/80 hover:text-gold transition-colors">
                      {item}
                    </Link>
                  </li>
                )}
            </ul>
          </div>

          {/* Contact & Info */}
          <div>
            <h3 className="font-serif text-xl text-gold mb-4">Join Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 text-cream-dark/80">
                <MapPin
                  className="text-burgundy-light shrink-0 mt-1"
                  size={20} />

                <span className="whitespace-pre-wrap">
                  {location}
                </span>
              </li>
              <li className="flex items-start space-x-3 text-cream-dark/80">
                <Clock
                  className="text-burgundy-light shrink-0 mt-1"
                  size={20} />

                <span className="whitespace-pre-wrap">
                  {massTimes}
                </span>
              </li>
              <li className="flex items-center space-x-3 text-cream-dark/80">
                <Mail className="text-burgundy-light shrink-0" size={20} />
                <span>{email}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-cream-dark/60">
          <p>
            &copy; {new Date().getFullYear()} {copyright}
          </p>
          <p className="mt-2 md:mt-0">Developed with faith by Wilfred Kimura</p>
        </div>
      </div>
    </footer>);

}