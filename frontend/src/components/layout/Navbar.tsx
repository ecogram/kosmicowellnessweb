import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, Search, X, Bell, Heart } from 'lucide-react';
import { Container } from '../ui/Container';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartDrawerStore } from '../../store/useCartDrawerStore';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { useUnreadCount } from '../../hooks/useNotifications';
import { PlayStoreModal } from '../ui/PlayStoreModal';
import { HangingPlayStoreWidget } from './HangingPlayStoreWidget';

import { normalizeImageUrl } from '../../utils/imageUrl';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPlayStoreModalOpen, setIsPlayStoreModalOpen] = useState(false);
  const navigate = useNavigate();

  // Lock body scroll when mobile menu drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      const origOverflow = document.body.style.overflow;
      const origTouchAction = document.body.style.touchAction;
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      return () => {
        document.body.style.overflow = origOverflow;
        document.body.style.touchAction = origTouchAction;
      };
    }
  }, [isMobileMenuOpen]);

  const { user, isAuthenticated } = useAuthStore();
  const { data: cart } = useCart();
  const { data: wishlist } = useWishlist();
  const { data: unreadCount = 0 } = useUnreadCount();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Care Hub 🩺', path: '/care' },
    { name: 'About', path: '/about' },
    { name: 'How It Works', path: '/how-it-works' },
  ];

  return (
    <nav className="bg-surface/95 backdrop-blur-md border-b border-border shadow-xs relative sticky top-0 z-40">
      <Container className="px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2 sm:gap-4">
          
          {/* Left: Mobile/Tab Menu button & Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3.5 md:gap-4 min-w-0 shrink-0">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-text-main w-10 h-10 rounded-xl flex items-center justify-center hover:bg-neutral-100 active:scale-95 md:hidden shrink-0 hover:text-primary transition-all cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            <Link to="/" className="flex items-center gap-2 sm:gap-3 shrink-0 group">
              <img
                src="/logo.png"
                alt="Kosmico"
                className="h-8 sm:h-9 md:h-10 w-auto object-contain rounded-lg shrink-0 filter drop-shadow-xs transition-transform duration-200 group-hover:scale-105"
              />
              <span className="font-serif font-black text-[15px] sm:text-xl md:text-2xl tracking-tight whitespace-nowrap flex items-center gap-1 leading-none select-none">
                <span className="text-emerald-950 font-black">Kosmico</span>
                <span className="text-[#0a7a40] font-extrabold">Wellness</span>
              </span>
            </Link>
          </div>

          {/* Center: Desktop Navigation (768px+) */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-6 xl:space-x-8 shrink-0">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-xs lg:text-sm font-medium text-text-main hover:text-primary hover:bg-emerald-50/60 px-2.5 py-1.5 rounded-lg transition-all"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right: Action Icons (Search, Wishlist, Notifications, Account, Cart) */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 shrink-0">
            
            {/* Search Button */}
            <button
              className="text-text-main hover:text-primary transition-all w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center hover:bg-neutral-100 active:scale-95 cursor-pointer"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Search"
            >
              {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </button>

            {/* Wishlist Button */}
            <Link
              to="/wishlist"
              className="text-text-main hover:text-rose-600 transition-all relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center hover:bg-neutral-100 active:scale-95"
              title="My Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlist?.items?.length > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-rose-500 text-white text-[9px] font-bold h-4 w-4 min-w-[16px] rounded-full flex items-center justify-center ring-2 ring-white shadow-xs">
                  {wishlist.items.length > 9 ? '9+' : wishlist.items.length}
                </span>
              )}
            </Link>

            {/* Notification Bell */}
            <Link
              to="/notifications"
              className="text-text-main hover:text-primary transition-all relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center hover:bg-neutral-100 active:scale-95"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-red-600 text-white text-[9px] font-bold h-4 w-4 min-w-[16px] rounded-full flex items-center justify-center ring-2 ring-white shadow-xs">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>

            {/* User Account / Login */}
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center space-x-2 md:space-x-3">
                <Link
                  to="/orders"
                  className="text-text-main hover:text-primary hover:bg-emerald-50/60 px-2 py-1 rounded-lg transition-all font-medium text-xs lg:text-sm"
                >
                  Orders
                </Link>
                <Link
                  to="/profile"
                  className="text-text-main hover:text-primary hover:bg-emerald-50/60 px-2 py-1 rounded-lg transition-all font-medium text-xs lg:text-sm flex items-center gap-1.5"
                >
                  {(() => {
                    const navPic =
                      user?.profilePicture ||
                      user?.profileImage ||
                      user?.avatar ||
                      user?.avatarUrl ||
                      user?.image ||
                      (user as any)?.photo ||
                      '';
                    if (!navPic) return null;
                    return (
                      <img
                        src={normalizeImageUrl(navPic)}
                        alt={user?.name || 'User'}
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        className="w-6 h-6 rounded-full object-cover border border-emerald-600 shadow-2xs"
                      />
                    );
                  })()}
                  <span>{(user?.name || (user as any)?.fullName || 'User').split(' ')[0]}</span>
                </Link>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-text-main hover:text-primary transition-all hidden sm:flex w-9 h-9 sm:w-10 sm:h-10 rounded-xl items-center justify-center hover:bg-neutral-100 active:scale-95"
                title="Account"
                aria-label="Account"
              >
                <User className="h-5 w-5" />
              </Link>
            )}

            {/* Shopping Cart Drawer Trigger */}
            <button
              onClick={() => useCartDrawerStore.getState().openDrawer()}
              className="text-text-main hover:text-primary transition-all relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center hover:bg-neutral-100 active:scale-95 focus:outline-none cursor-pointer"
              aria-label="Open cart drawer"
            >
              <ShoppingCart className="h-5 w-5" />
              {cart?.items?.length > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-accent text-white text-[9px] font-bold h-4 w-4 min-w-[16px] rounded-full flex items-center justify-center ring-2 ring-white shadow-xs animate-pulse">
                  {cart.items.reduce((acc: number, item: any) => acc + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </Container>

      {/* Search Bar in document flow (Not absolute) so it pushes the page content down naturally without cutting any text */}
      {isSearchOpen && (
        <div className="border-t border-emerald-950/10 bg-white/98 backdrop-blur-md px-4 py-3 sm:px-6 lg:px-8 w-full relative z-40 shadow-sm transition-all duration-300 animate-fadeIn">
          <form onSubmit={handleSearchSubmit} className="relative max-w-3xl mx-auto flex items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-emerald-800 pointer-events-none" />
            <input
              type="text"
              autoFocus
              placeholder="Search for products, sweeteners, ayurveda..."
              className="w-full pl-10 pr-10 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 focus:bg-white transition-all shadow-inner"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                title="Clear"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="absolute right-3 text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
                title="Close search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>
        </div>
      )}

      {/* Mobile Menu Portal (Attached directly to document.body to avoid sticky header clipping) */}
      {typeof document !== 'undefined' && isMobileMenuOpen && createPortal(
        <div className="fixed inset-0 z-[9999] md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity duration-300 touch-none"
            onClick={() => setIsMobileMenuOpen(false)}
            onTouchMove={(e) => e.preventDefault()}
          />

          {/* Full-Height Mobile Drawer */}
          <div
            className="fixed inset-y-0 left-0 z-[10000] w-[85vw] max-w-sm bg-white text-neutral-900 shadow-2xl border-r border-neutral-200 flex flex-col h-full max-h-screen overflow-hidden animate-slideInRight overscroll-contain"
            style={{ backgroundColor: '#ffffff' }}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-white text-neutral-900 shrink-0">
              <div className="flex items-center gap-2.5">
                <img src="/logo.png" alt="Kosmico" className="h-7 w-auto object-contain" />
                <span className="font-serif text-lg font-bold text-emerald-900">Menu</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-neutral-600 hover:text-neutral-900 p-2 rounded-full hover:bg-neutral-100 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Clean Navigation Buttons - Scrollable with overscroll-contain & touch-pan-y */}
            <div 
              className="flex flex-col p-4 space-y-3 bg-white flex-1 overflow-y-auto overscroll-contain touch-pan-y" 
              style={{ backgroundColor: '#ffffff', WebkitOverflowScrolling: 'touch' }}
            >
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="px-4 py-3 rounded-xl bg-neutral-50 hover:bg-emerald-50 text-neutral-900 hover:text-emerald-900 font-bold text-base border border-neutral-200 transition-all active:scale-98 block"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsPlayStoreModalOpen(true);
                }}
                className="w-full text-left px-4 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-base transition-all flex items-center justify-between active:scale-98 shadow-xs"
              >
                <span>Get Mobile App</span>
                <span className="text-xs bg-amber-400 text-neutral-950 px-2 py-0.5 rounded-full font-black">Play Store 📱</span>
              </button>

              <div className="pt-2 border-t border-neutral-200">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <Link
                      to="/coupons"
                      className="px-4 py-2.5 rounded-xl text-neutral-800 hover:bg-neutral-100 font-semibold text-sm flex items-center justify-between"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🎟️</span>
                        <span>Coupons &amp; Offers</span>
                      </div>
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                        Offers
                      </span>
                    </Link>
                    <Link
                      to="/orders"
                      className="px-4 py-2.5 rounded-xl text-neutral-800 hover:bg-neutral-100 font-semibold text-sm block"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      📦 My Orders
                    </Link>
                    <Link
                      to="/profile"
                      className="px-4 py-2.5 rounded-xl text-neutral-800 hover:bg-neutral-100 font-semibold text-sm flex items-center gap-2.5"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {(() => {
                        const navPic =
                          user?.profilePicture ||
                          user?.profileImage ||
                          user?.avatar ||
                          user?.avatarUrl ||
                          user?.image ||
                          (user as any)?.photo ||
                          '';
                        if (navPic) {
                          return (
                            <img
                              src={normalizeImageUrl(navPic)}
                              alt={user?.name || 'User'}
                              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                              className="w-5 h-5 rounded-full object-cover border border-emerald-600"
                            />
                          );
                        }
                        return <span>👤</span>;
                      })()}
                      <span>Profile ({user?.name})</span>
                    </Link>
                    <button
                      onClick={() => {
                        useAuthStore.getState().logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 font-semibold text-sm block"
                    >
                      🚪 Log Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/coupons"
                      className="px-4 py-2.5 rounded-xl text-neutral-800 hover:bg-neutral-100 font-semibold text-sm flex items-center justify-between"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🎟️</span>
                        <span>Coupons &amp; Offers</span>
                      </div>
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                        4 Active
                      </span>
                    </Link>
                    <Link
                      to="/login"
                      className="px-4 py-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-bold text-base flex items-center gap-2 transition-all block text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="w-5 h-5 inline-block text-neutral-700" />
                      <span>Account / Sign In</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Direct Play Store Modal Trigger */}
      <PlayStoreModal
        isOpen={isPlayStoreModalOpen}
        onClose={() => setIsPlayStoreModalOpen(false)}
        featureTitle="Kosmico Care Hub Mobile App"
        featureDescription="Access all clinical-grade health suite tools, smartwatch biometrics, and AI food scanner directly on the Kosmico Mobile App."
      />

      {/* Hanging Play Store Ornament anchored inside Navbar */}
      <HangingPlayStoreWidget />
    </nav>
  );
}
