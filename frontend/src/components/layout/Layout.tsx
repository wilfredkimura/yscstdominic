import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-cream selection:bg-gold/30 selection:text-navy">
      <Navbar />
      <main className="flex-grow pt-20 relative z-0">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}