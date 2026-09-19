import { useState } from 'react';
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
    <nav className="bg-surface/95 backdrop-blur-md border-b border-border shadow-xs relative">
      <Container>
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Left: Mobile Menu button & Brand Logo */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-text-main p-1.5 focus:outline-none md:hidden shrink-0"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link to="/" className="flex items-center gap-2 font-serif text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-primary min-w-0">
              <img src="/logo.png" alt="Kosmico" className="h-7 sm:h-8 w-auto object-contain rounded-md shrink-0" />
              <span className="truncate sm:whitespace-nowrap">Kosmico Wellness</span>
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8 shrink-0">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-sm font-medium text-text-main hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right: Action Icons */}
          <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
            <button 
              className="text-text-main hover:text-primary transition-colors p-1"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </button>

            {/* Wishlist Button (Always accessible) */}
            <Link
              to="/wishlist"
              className="text-text-main hover:text-rose-600 transition-colors relative p-1"
              title="My Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlist?.items?.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-xs">
                  {wishlist.items.length > 9 ? '9+' : wishlist.items.length}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="hidden sm:flex items-center space-x-3 lg:space-x-4">
                <Link
                  to="/orders"
                  className="text-text-main hover:text-primary transition-colors font-medium text-sm"
                >
                  Orders
                </Link>
                <Link
                  to="/notifications"
                  className="text-text-main hover:text-primary transition-colors relative"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-error text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/profile"
                  className="text-text-main hover:text-primary transition-colors font-medium text-sm flex items-center gap-1.5"
                >
                  {(user?.profilePicture || (user as any)?.profileImage) ? (
                    <img
                      src={normalizeImageUrl(user?.profilePicture || (user as any)?.profileImage)}
                      alt={user?.name || 'User'}
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      className="w-6 h-6 rounded-full object-cover border border-emerald-600"
                    />
                  ) : null}
                  <span>{(user?.name || (user as any)?.fullName || 'User').split(' ')[0]}</span>
                </Link>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-text-main hover:text-primary transition-colors hidden sm:block p-1"
              >
                <User className="h-5 w-5" />
              </Link>
            )}
            <button
              onClick={() => useCartDrawerStore.getState().openDrawer()}
              className="text-text-main hover:text-primary transition-colors relative p-1 focus:outline-none"
              aria-label="Open cart drawer"
            >
              <ShoppingCart className="h-5 w-5" />
              {cart?.items?.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                  {cart.items.reduce((acc: number, item: any) => acc + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </Container>

      {/* Search Bar Dropdown */}
      {isSearchOpen && (
        <div className="border-t border-border bg-surface px-4 py-3 sm:px-6 lg:px-8 absolute w-full left-0 z-40 shadow-md">
          <form onSubmit={handleSearchSubmit} className="relative max-w-3xl mx-auto flex items-center">
            <Search className="absolute left-3 h-5 w-5 text-text-muted" />
            <input
              type="text"
              autoFocus
              placeholder="Search for products..."
              className="w-full pl-10 pr-10 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-text-muted hover:text-text-main"
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
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Full-Height Mobile Drawer */}
          <div
            className="fixed inset-y-0 left-0 z-[10000] w-[85vw] max-w-sm bg-white text-neutral-900 shadow-2xl border-r border-neutral-200 flex flex-col h-full max-h-screen overflow-hidden animate-slideInRight"
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

            {/* Clean Navigation Buttons */}
            <div className="flex flex-col p-4 space-y-3 bg-white flex-1" style={{ backgroundColor: '#ffffff' }}>
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
                      to="/wishlist"
                      className="px-4 py-2.5 rounded-xl text-neutral-800 hover:bg-neutral-100 font-semibold text-sm flex items-center justify-between"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
                        <span>❤️ My Wishlist</span>
                      </div>
                      {wishlist?.items?.length > 0 && (
                        <span className="bg-rose-100 text-rose-700 text-xs px-2 py-0.5 rounded-full font-bold">
                          {wishlist.items.length}
                        </span>
                      )}
                    </Link>
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
                      to="/notifications"
                      className="px-4 py-2.5 rounded-xl text-neutral-800 hover:bg-neutral-100 font-semibold text-sm flex items-center justify-between"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-emerald-800" />
                        <span>🔔 Notifications</span>
                      </div>
                      {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
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
                      className="px-4 py-2.5 rounded-xl text-neutral-800 hover:bg-neutral-100 font-semibold text-sm block"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      👤 Profile ({user?.name})
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
                      to="/wishlist"
                      className="px-4 py-2.5 rounded-xl text-neutral-800 hover:bg-neutral-100 font-semibold text-sm flex items-center justify-between"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
                        <span>❤️ My Wishlist</span>
                      </div>
                      {wishlist?.items?.length > 0 && (
                        <span className="bg-rose-100 text-rose-700 text-xs px-2 py-0.5 rounded-full font-bold">
                          {wishlist.items.length}
                        </span>
                      )}
                    </Link>
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
