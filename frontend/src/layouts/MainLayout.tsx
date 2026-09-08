import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AnnouncementBar } from '../components/layout/AnnouncementBar';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { WhatsAppButton } from '../components/layout/WhatsAppButton';
import { AiConsultantButton } from '../components/layout/AiConsultantButton';
import { CartDrawer } from '../components/cart/CartDrawer';


export function MainLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex flex-col min-h-screen relative bg-gradient-to-b from-emerald-50/60 via-stone-50/40 to-emerald-50/50">
      {/* Global Luxury Ambient Glow Background Orbs */}
      <div className="fixed top-1/6 -left-32 w-[600px] h-[600px] bg-emerald-300/15 rounded-full blur-3xl pointer-events-none z-0 animate-pulse-glow" />
      <div className="fixed top-1/2 -right-32 w-[650px] h-[650px] bg-amber-300/15 rounded-full blur-3xl pointer-events-none z-0 animate-pulse-glow" />
      <div className="fixed bottom-10 left-1/3 w-[500px] h-[500px] bg-emerald-200/10 rounded-full blur-3xl pointer-events-none z-0" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="sticky top-0 z-50 shadow-md">
          <AnnouncementBar />
          <Navbar />
        </header>
        <main className="flex-grow">
          <Outlet />
        </main>
        <Footer />
        <AiConsultantButton />
        <WhatsAppButton />
        <CartDrawer />
      </div>
    </div>
  );
}
