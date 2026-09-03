import { Link } from 'react-router-dom';
import { Container } from '../ui/Container';
import { useCategories } from '../../hooks/useProducts';

export function Footer() {
  const { data: categories } = useCategories();
  return (
    <footer className="bg-primary-dark text-white pt-16 pb-8">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <h3 className="font-serif text-2xl font-bold text-accent mb-4">Kosmiko Wellness</h3>
            <p className="text-secondary/80 text-sm leading-relaxed mb-6">
              The natural, zero-calorie monk fruit sweetener that tastes just like sugar. Pure
              sweetness, no compromises.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-accent transition-colors">
                Instagram
              </a>
              <a href="#" className="text-white hover:text-accent transition-colors">
                Facebook
              </a>
              <a href="#" className="text-white hover:text-accent transition-colors">
                Twitter
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Shop</h4>
            <ul className="space-y-3 text-sm text-secondary/80">
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

          <div>
            <h4 className="font-bold text-lg mb-4">Information</h4>
            <ul className="space-y-3 text-sm text-secondary/80">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Our Story
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
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Stay in the loop</h4>
            <p className="text-sm text-secondary/80 mb-4">
              Sign up for exclusive offers, recipes, and news.
            </p>
            <form className="flex flex-col space-y-2">
              <input
                type="email"
                placeholder="Your email address"
                className="bg-white/10 border border-white/20 rounded-md px-4 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:border-accent"
              />
              <button
                type="submit"
                className="bg-accent text-primary-dark font-bold py-2 rounded-md hover:bg-accent-hover transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-secondary/60">
          <p>&copy; {new Date().getFullYear()} Kosmiko Wellness. All rights reserved.</p>
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
