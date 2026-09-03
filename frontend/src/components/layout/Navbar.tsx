import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, Search, X, Bell } from 'lucide-react';
import { Container } from '../ui/Container';
import { useAuthStore } from '../../store/useAuthStore';
import { useCart } from '../../hooks/useCart';
import { useUnreadCount } from '../../hooks/useNotifications';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const { user, isAuthenticated } = useAuthStore();
  const { data: cart } = useCart();
  const { data: unreadCount } = useUnreadCount();

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
    { name: 'Shop', path: '/shop' },
    { name: 'Benefits', path: '/benefits' },
    { name: 'Ingredients', path: '/ingredients' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'About', path: '/about' },
    { name: 'FAQ', path: '/faq' },
  ];

  return (
    <nav className="bg-surface sticky top-0 z-50 border-b border-border shadow-sm">
      <Container>
        <div className="flex justify-between items-center h-16">
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-text-main p-2 focus:outline-none"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center justify-center md:justify-start w-full md:w-auto">
            <Link to="/" className="flex items-center gap-2.5 font-serif text-2xl font-bold tracking-tight text-primary">
              <img src="/logo.png" alt="Kosmico" className="h-8 w-auto object-contain rounded-md" />
              <span>Kosmiko Wellness</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
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

          {/* Icons */}
          <div className="flex items-center space-x-4 absolute right-4 md:static">
            <button 
              className="text-text-main hover:text-primary transition-colors"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </button>
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center space-x-4">
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
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/profile"
                  className="text-text-main hover:text-primary transition-colors font-medium text-sm"
                >
                  {user?.name?.split(' ')[0]}
                </Link>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-text-main hover:text-primary transition-colors hidden sm:block"
              >
                <User className="h-5 w-5" />
              </Link>
            )}
            <Link
              to="/cart"
              className="text-text-main hover:text-primary transition-colors relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {cart?.items?.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {cart.items.reduce((acc: number, item: any) => acc + item.quantity, 0)}
                </span>
              )}
            </Link>
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

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-overlay bg-black/50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-modal w-64 bg-surface transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="font-serif text-xl font-bold text-primary">Menu</span>
          <button onClick={() => setIsMobileMenuOpen(false)} className="text-text-main p-2">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex flex-col p-4 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-base font-medium text-text-main hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-border flex flex-col space-y-4">
            {isAuthenticated ? (
              <Link
                to="/profile"
                className="flex items-center text-base font-medium text-text-main hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="h-5 w-5 mr-3" /> {user?.name}
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex items-center text-base font-medium text-text-main hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="h-5 w-5 mr-3" /> Account
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
