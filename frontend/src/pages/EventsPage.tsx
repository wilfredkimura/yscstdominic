import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Loader2, X, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import api from '../services/api';

export function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPast, setShowPast] = useState(false);

  // RSVP State
  const [rsvpEvent, setRsvpEvent] = useState<any>(null);
  const [rsvpData, setRsvpData] = useState({ name: '', phone_number: '' });
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [rsvpError, setRsvpError] = useState('');
  const [rsvpSuccess, setRsvpSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, configRes] = await Promise.all([
          api.get('/events'),
          api.get('/config')
        ]);
        setEvents(eventsRes.data);
        setConfig(configRes.data);
      } catch (err) {
        console.error('Failed to fetch events', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const now = new Date();
  const filteredEvents = events.filter((e) => {
    const eventDate = new Date(e.event_date || e.date);
    return showPast ? eventDate < now : eventDate >= now;
  });

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRsvpLoading(true);
    setRsvpError('');
    try {
      await api.post(`/events/${rsvpEvent.id}/rsvp`, rsvpData);
      setRsvpSuccess(true);
      setTimeout(() => {
        closeRsvpModal();
      }, 3000);
    } catch (err: any) {
      setRsvpError(err.response?.data?.error || 'Failed to submit RSVP. Please try again.');
    } finally {
      setRsvpLoading(false);
    }
  };

  const closeRsvpModal = () => {
    setRsvpEvent(null);
    setRsvpData({ name: '', phone_number: '' });
    setRsvpError('');
    setRsvpSuccess(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-cream"><Loader2 className="animate-spin text-burgundy" size={48} /></div>;

  return (
    <div className="w-full bg-cream min-h-screen pb-20">
      <div className="bg-navy text-softWhite py-12 md:py-16 px-4 text-center relative overflow-hidden">
        {config?.page_backgrounds?.events && (
          <div className="absolute inset-0 opacity-20">
            <img src={config.page_backgrounds.events} alt="" className="w-full h-full object-cover" />
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
            Community Events
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
            Gatherings, mass, retreats, and service opportunities.
          </motion.p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8">
        {/* Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-softWhite p-1 rounded-lg inline-flex shadow-sm border border-cream-dark">
            <button
              onClick={() => setShowPast(false)}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${!showPast ? 'bg-navy text-softWhite shadow' : 'text-navy/70 hover:text-navy'}`}>
              Upcoming Events
            </button>
            <button
              onClick={() => setShowPast(true)}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${showPast ? 'bg-navy text-softWhite shadow' : 'text-navy/70 hover:text-navy'}`}>
              Past Events
            </button>
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-6">
          {filteredEvents.length === 0 ?
            <div className="text-center py-12 text-navy/50 font-serif italic text-lg">
              No events found in this category.
            </div> :
            filteredEvents.map((event, index) => {
              const dateObj = new Date(event.event_date || event.date);
              const month = dateObj.toLocaleString('default', {
                month: 'short'
              });
              const day = dateObj.getDate();
              const weekday = dateObj.toLocaleString('default', {
                weekday: 'long'
              });
              return (
                <motion.div
                  key={event.id}
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
                  <Card
                    className={`flex flex-col md:flex-row overflow-hidden ${showPast ? 'opacity-75 grayscale hover:grayscale-0 transition-all' : ''}`}>
                    {/* Date Badge (Desktop) */}
                    <div className="hidden md:flex flex-col items-center justify-center bg-cream-dark/50 w-32 shrink-0 border-r border-cream-dark">
                      <span className="text-sm font-bold uppercase text-burgundy mb-1">
                        {month}
                      </span>
                      <span className="text-4xl font-serif font-bold text-navy leading-none mb-1">
                        {day}
                      </span>
                      <span className="text-xs text-navy/60 font-medium">
                        {weekday}
                      </span>
                    </div>

                    {/* Image */}
                    <div className="md:w-64 h-48 md:h-auto shrink-0 relative">
                      <img
                        src={event.image_url || 'https://images.unsplash.com/photo-1510673398445-94f476ef2cbc?w=500&h=400&fit=crop'}
                        alt={event.title}
                        className="w-full h-full object-cover" />

                      {/* Date Badge (Mobile) */}
                      <div className="md:hidden absolute top-4 left-4 bg-softWhite text-navy rounded-lg p-2 text-center shadow-md min-w-[60px]">
                        <span className="block text-xs font-bold uppercase text-burgundy">
                          {month}
                        </span>
                        <span className="block text-xl font-serif font-bold leading-none mt-1">
                          {day}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col justify-center flex-grow">
                      <h2 className="text-xl md:text-2xl font-serif font-bold text-navy mb-3">
                        {event.title}
                      </h2>
                      <p className="text-navy/70 mb-4 line-clamp-2">{event.description}</p>

                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mt-auto pt-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-navy/80 font-medium">
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-burgundy" />
                            <span>{event.time || 'Check details'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-burgundy" />
                            <span>{event.location}</span>
                          </div>
                        </div>

                        {!showPast && (
                          <button
                            onClick={() => setRsvpEvent(event)}
                            className="bg-burgundy hover:bg-burgundy-light text-softWhite px-6 py-2 rounded-lg font-medium transition-colors whitespace-nowrap w-full sm:w-auto mt-4 sm:mt-0"
                          >
                            RSVP Now
                          </button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          }
        </div>
      </div>

      {/* RSVP Modal */}
      <AnimatePresence>
        {rsvpEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-navy/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-softWhite rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl relative"
            >
              <button
                onClick={closeRsvpModal}
                className="absolute top-4 right-4 text-navy/50 hover:text-burgundy transition-colors"
                disabled={rsvpLoading}
              >
                <X size={24} />
              </button>

              {rsvpSuccess ? (
                <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-navy mb-2">RSVP Confirmed!</h3>
                  <p className="text-navy/70">
                    We've saved your spot for <span className="font-semibold">{rsvpEvent.title}</span>. See you there!
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-serif font-bold text-navy mb-2">Reserve Your Spot</h3>
                  <p className="text-navy/60 mb-6">Let us know you're coming to {rsvpEvent.title}.</p>

                  <form onSubmit={handleRsvpSubmit} className="space-y-4">
                    {rsvpError && (
                      <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
                        {rsvpError}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-navy/80 mb-1.5">Full Name</label>
                      <input
                        type="text"
                        required
                        value={rsvpData.name}
                        onChange={e => setRsvpData({ ...rsvpData, name: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white border border-navy/10 rounded-lg focus:ring-2 focus:ring-burgundy focus:border-transparent outline-none transition-all placeholder:text-navy/30"
                        placeholder="John Doe"
                        disabled={rsvpLoading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-navy/80 mb-1.5">Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={rsvpData.phone_number}
                        onChange={e => setRsvpData({ ...rsvpData, phone_number: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white border border-navy/10 rounded-lg focus:ring-2 focus:ring-burgundy focus:border-transparent outline-none transition-all placeholder:text-navy/30"
                        placeholder="+254 700 000 000"
                        disabled={rsvpLoading}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={rsvpLoading}
                      className="w-full bg-burgundy hover:bg-burgundy-light text-softWhite py-3 rounded-lg font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center mt-6"
                    >
                      {rsvpLoading ? <Loader2 className="animate-spin" size={20} /> : 'Confirm RSVP'}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}