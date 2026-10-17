import { Link } from 'react-router-dom';
import { Container } from '../ui/Container';
import { useCategories } from '../../hooks/useProducts';
import { MapPin, Phone, Mail, Clock, Smartphone, Users } from 'lucide-react';
import { PLAY_STORE_URL, YOUTUBE_URL, INSTAGRAM_URL, FACEBOOK_URL } from '../../utils/constants';

export function Footer() {
  const { data: categories } = useCategories();
  return (
    <footer className="bg-emerald-950 text-white pt-16 pb-8 border-t border-emerald-900">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 md:gap-12 mb-12">
          
          {/* Brand Info (Full width on mobile, 1 column on desktop) */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <h3 className="font-serif text-2xl font-bold text-amber-400">Kosmico Wellness</h3>
            <p className="text-sm text-neutral-300/80 leading-relaxed font-normal">
              KOSMICO WELLNESS PRIVATE LIMITED — India's leading manufacturer of 100% natural zero-calorie Sweet Monk sweeteners and Ayurvedic healthcare products.
            </p>
            <div className="pt-1 text-xs font-semibold text-emerald-200">
              Ancient Wisdom, Modern Living
            </div>
            
            {/* Direct Play Store & Community Links in Footer */}
            <div className="pt-2 flex flex-col gap-2">
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-emerald-700/50 hover:border-amber-400/60 rounded-xl text-xs font-bold text-amber-300 transition-all shadow-xs"
              >
                <Smartphone className="w-4 h-4 text-amber-400" />
                <span>Get App on Google Play 📱</span>
              </a>

              <Link
                to="/community"
                className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-700/60 hover:border-amber-400/60 rounded-xl text-xs font-bold text-emerald-100 hover:text-white transition-all shadow-xs"
              >
                <Users className="w-4 h-4 text-amber-400" />
                <span>Join Community & Upload Posts 🌿</span>
              </Link>
            </div>
          </div>

          {/* Shop Column (Left column on mobile) */}
          <div className="col-span-1">
            <h4 className="font-bold text-sm uppercase tracking-wider text-amber-300 mb-4">Shop</h4>
            <ul className="space-y-2.5 text-xs text-emerald-100/80">
              <li>
                <Link to="/shop" className="hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              {categories?.map((cat: any) => (
                <li key={cat._id}>
                  <Link to={`/shop?category=${cat._id || cat.slug || cat.name}`} className="hover:text-white transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Information Column (Right column on mobile) */}
          <div className="col-span-1">
            <h4 className="font-bold text-sm uppercase tracking-wider text-amber-300 mb-4">Information</h4>
            <ul className="space-y-2.5 text-xs text-emerald-100/80">
              <li>
                <Link to="/community" className="hover:text-white transition-colors flex items-center gap-1.5 font-bold text-amber-300">
                  <span>Community</span>
                  <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                    New
                  </span>
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Kosmico
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/care" className="hover:text-white transition-colors">
                  Care Hub
                </Link>
              </li>
              <li>
                <Link to="/benefits" className="hover:text-white transition-colors">
                  Benefits
                </Link>
              </li>
              <li>
                <Link to="/ingredients" className="hover:text-white transition-colors">
                  Ingredients
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors font-bold text-amber-200">
                  Contact Us &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details Column (Full width on mobile, 1 column on desktop - Right side) */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <h4 className="font-bold text-sm uppercase tracking-wider text-amber-300 mb-4">Contact Details</h4>
            
            <div className="text-xs text-emerald-100/90 space-y-3 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                   423 A, 4th Floor, Tower 3, NX One Tower, Greater Noida (West), UP - 201306
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href="tel:+919793170555" className="font-bold hover:underline text-white">
                  +91 97931 70555
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href="mailto:support@kosmicowellness.com" className="hover:underline text-white truncate">
                  support@kosmicowellness.com
                </a>
              </div>

              <div className="flex items-center gap-2.5 pt-1 text-[11px] text-emerald-200">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Mon - Sat: 11:00 AM - 7:00 PM</span>
              </div>
            </div>

            {/* Social Media Links (Right Side) */}
            <div className="pt-3 border-t border-emerald-900/80">
              <span className="block text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2.5">
                Follow Us
              </span>
              <div className="flex items-center gap-2.5">
                {/* YouTube */}
                <a
                  href={YOUTUBE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube Channel"
                  title="YouTube"
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#FF0000] border border-emerald-700/50 hover:border-[#FF0000] flex items-center justify-center text-emerald-200 hover:text-white transition-all duration-300 hover:scale-110 shadow-xs"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram Profile"
                  title="Instagram"
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] border border-emerald-700/50 hover:border-pink-500 flex items-center justify-center text-emerald-200 hover:text-white transition-all duration-300 hover:scale-110 shadow-xs"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>

                {/* Facebook */}
                <a
                  href={FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook Page"
                  title="Facebook"
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#1877F2] border border-emerald-700/50 hover:border-[#1877F2] flex items-center justify-center text-emerald-200 hover:text-white transition-all duration-300 hover:scale-110 shadow-xs"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="border-t border-emerald-900 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-emerald-300/70">
          <p>&copy; {new Date().getFullYear()} KOSMICO WELLNESS PRIVATE LIMITED. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-white">
              Terms of Service
            </Link>
            <Link to="/refunds" className="hover:text-white">
              Refund Policy
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
