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
    <div className="flex flex-col min-h-screen">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <AiConsultantButton />
      <WhatsAppButton />
      <CartDrawer />
    </div>
  );
}

