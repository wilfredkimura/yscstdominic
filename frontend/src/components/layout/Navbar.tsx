import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, ArrowRight, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SearchOverlay } from './SearchOverlay';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleShortcuts = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleShortcuts);
    return () => window.removeEventListener('keydown', handleShortcuts);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Events', path: '/events' },
    { name: 'Blog', path: '/blog' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Resources', path: '/resources' },
    { name: 'Prayer Wall', path: '/prayer-wall' }
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 ${isScrolled ? 'bg-softWhite/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg shadow-sm flex items-center justify-center p-1 group-hover:shadow-md transition-all">
                <img src="/logo.png" alt="YSC Logo" className="w-full h-full object-contain" />
              </div>
              <span
                className={`font-serif font-semibold text-xl tracking-wide ${isScrolled ? 'text-navy' : 'text-navy drop-shadow-sm'}`}>
                YSC St. Dominic
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-medium transition-colors relative py-1 ${isActive(link.path) ? 'text-burgundy' : 'text-navy hover:text-burgundy'}`}>
                  {link.name}
                  {isActive(link.path) && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold rounded-full"
                      initial={false}
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30
                      }}
                    />
                  )}
                </Link>
              ))}

              <button
                onClick={() => setIsSearchOpen(true)}
                className={`p-2 rounded-full transition-all group ${isScrolled ? 'hover:bg-navy/5 text-navy' : 'hover:bg-white/10 text-navy'}`}
                title="Search (Ctrl + K)"
              >
                <Search size={18} className="group-hover:scale-110 transition-transform" />
              </button>

              <div className="flex items-center space-x-4 ml-4">
                {!user ? (
                  <div className="flex items-center space-x-4">
                    <Link
                      to="/signup?mode=signup"
                      className="bg-burgundy text-gold px-6 py-2.5 rounded-xl text-sm font-bold tracking-widest uppercase hover:bg-burgundy-light transition-all shadow-lg hover:shadow-burgundy/20 active:scale-95 flex items-center gap-2 group"
                    >
                      <span>Join Community</span>
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    {user.role === 'Admin' && (
                      <Link
                        to="/admin"
                        className="text-[10px] uppercase tracking-wider font-bold text-gold bg-burgundy px-2 py-0.5 rounded shadow-sm hover:bg-burgundy-light transition-all">
                        Admin
                      </Link>
                    )}
                    <div className="relative group/user">
                      <button className="bg-burgundy/10 p-2 rounded-full text-burgundy">
                        <User size={20} />
                      </button>
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-navy/10 rounded-lg shadow-xl py-2 opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible transition-all">
                        <div className="px-4 py-2 border-b border-navy/5">
                          <p className="text-sm font-medium text-navy truncate">{user.full_name}</p>
                          <p className="text-xs text-navy/50 truncate">{user.email}</p>
                        </div>
                        <button
                          onClick={logout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </nav>

            <div className="flex items-center space-x-1 md:hidden">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="text-navy p-2 hover:bg-navy/5 rounded-full transition-colors"
                aria-label="Search"
              >
                <Search size={20} />
              </button>
              <button
                className="text-navy p-2"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open menu">
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-[1001] md:hidden"
              onClick={() => setIsMobileMenuOpen(false)} />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{
                type: 'spring',
                bounce: 0,
                duration: 0.4
              }}
              className="fixed top-0 right-0 bottom-0 w-3/4 max-w-sm bg-cream z-[1002] shadow-2xl flex flex-col md:hidden">

              <div className="p-5 flex justify-end">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-navy p-2 bg-cream-dark rounded-full hover:bg-gold/20 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex flex-col px-6 py-4 space-y-6 overflow-y-auto">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`text-2xl font-serif ${isActive(link.path) ? 'text-burgundy font-semibold' : 'text-navy'}`}>
                    {link.name}
                  </Link>
                ))}

                <div className="pt-8 mt-8 border-t border-cream-dark space-y-4">
                  {!user ? (
                    <Link
                      to="/signup?mode=signup"
                      className="w-full bg-burgundy text-gold p-4 rounded-xl text-center font-bold tracking-widest uppercase shadow-lg shadow-burgundy/10 flex items-center justify-center gap-3"
                    >
                      <span>Join Community</span>
                      <ArrowRight size={20} />
                    </Link>
                  ) : (
                    <>
                      {user.role === 'Admin' && (
                        <Link
                          to="/admin"
                          className="text-navy/60 hover:text-burgundy flex items-center space-x-2 group">
                          <span className="w-1.5 h-1.5 rounded-full bg-gold group-hover:bg-burgundy transition-colors" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}
                      <button
                        onClick={logout}
                        className="text-xl font-serif text-red-600"
                      >
                        Sign Out
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}