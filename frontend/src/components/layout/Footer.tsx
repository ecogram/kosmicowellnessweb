import { Link } from 'react-router-dom';
import { Container } from '../ui/Container';
import { useCategories } from '../../hooks/useProducts';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export function Footer() {
  const { data: categories } = useCategories();
  return (
    <footer className="bg-emerald-950 text-white pt-16 pb-8 border-t border-emerald-900">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1 space-y-4">
            <h3 className="font-serif text-2xl font-bold text-amber-400">Kosmiko Wellness</h3>
            <p className="text-emerald-100/80 text-xs leading-relaxed">
              KOSMICO WELLNESS PRIVATE LIMITED — India's leading manufacturer of 100% natural zero-calorie monk fruit sweeteners and Ayurvedic healthcare products.
            </p>
            <div className="pt-2 text-xs font-semibold text-emerald-200">
              Ancient Wisdom, Modern Living
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-amber-300 mb-4">Shop</h4>
            <ul className="space-y-2.5 text-xs text-emerald-100/80">
              <li>
                <Link to="/shop" className="hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              {categories?.map((cat: any) => (
                <li key={cat._id}>
                  <Link to={`/shop?category=${cat.slug}`} className="hover:text-white transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Information Column */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-amber-300 mb-4">Information</h4>
            <ul className="space-y-2.5 text-xs text-emerald-100/80">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Kosmico
                </Link>
              </li>
              <li>
                <Link to="/care" className="hover:text-white transition-colors">
                  Care Hub 🩺
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

          {/* Contact Details Column matching App Video */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm uppercase tracking-wider text-amber-300 mb-4">Contact Details</h4>
            
            <div className="text-xs text-emerald-100/90 space-y-3 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  1305 &amp; 1307 A, 13th Floor, Tower 3, NX One Tower, Greater Noida (West), UP - 201306
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
                <a href="mailto:supportkosmicowellness@gmail.com" className="hover:underline text-white truncate">
                  supportkosmicowellness@gmail.com
                </a>
              </div>

              <div className="flex items-center gap-2.5 pt-1 text-[11px] text-emerald-200">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Mon - Sat: 11:00 AM - 7:00 PM</span>
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
