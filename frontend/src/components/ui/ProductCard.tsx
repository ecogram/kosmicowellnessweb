import { formatINR } from '../../utils/currency';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './Button';
import { Star, Heart, ShoppingBag, Zap } from 'lucide-react';
import { useAddToCart } from '../../hooks/useCart';
import { useToggleWishlist, useWishlist } from '../../hooks/useWishlist';
import { useAuthStore } from '../../store/useAuthStore';

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  secondaryImage?: string;
  rating: number;
  reviewsCount: number;
  badge?: string;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const addToCartMutation = useAddToCart();
  const toggleWishlistMutation = useToggleWishlist();
  const { data: wishlist } = useWishlist();

  const isWishlisted = wishlist?.items?.some((item: any) => 
    (typeof item === 'string' ? item : item._id) === product.id
  );

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return navigate('/login');
    addToCartMutation.mutate({ productId: product.id, quantity: 1 });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return navigate('/login');
    toggleWishlistMutation.mutate(product.id);
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return navigate('/login');
    await addToCartMutation.mutateAsync({ productId: product.id, quantity: 1 });
    navigate('/checkout');
  };

  return (
    <div className="group relative bg-white border border-emerald-950/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-emerald-950/10 hover:border-emerald-600/40 transition-all duration-300 flex flex-col h-full">
      {/* Light sweep ambient glow effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500 bg-gradient-to-tr from-emerald-500/5 via-transparent to-amber-500/5 z-0" />

      {/* Wishlist Button */}
      <button 
        onClick={handleToggleWishlist}
        disabled={toggleWishlistMutation.isPending}
        className="absolute top-3.5 right-3.5 z-20 p-2.5 rounded-full bg-white/90 backdrop-blur-md hover:bg-white text-neutral-400 hover:text-red-500 transition-all duration-300 shadow-md hover:scale-110 disabled:opacity-50"
        title="Add to Wishlist"
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
      </button>

      {/* Product Image Stage with 3D Pop & Hover Scale */}
      <Link
        to={`/products/${product.slug}`}
        className="block relative aspect-square bg-gradient-to-b from-neutral-50/80 to-emerald-50/30 overflow-hidden p-6 z-10"
      >
        {/* Original Main Image */}
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-105 group-hover:drop-shadow-xl"
        />

        {/* Floating Quick View hint */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 bg-emerald-900/80 backdrop-blur-md text-white text-[11px] font-semibold px-3.5 py-1 rounded-full shadow-lg pointer-events-none whitespace-nowrap">
          Click for details
        </div>
      </Link>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-grow z-10 bg-white">
        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-neutral-200 fill-neutral-200'}`}
            />
          ))}
          <span className="text-xs text-neutral-500 font-medium ml-1">({product.reviewsCount})</span>
        </div>

        {/* Product Title */}
        <Link
          to={`/products/${product.slug}`}
          className="block group/title"
        >
          <h3 className="font-serif font-bold text-base md:text-lg mb-2 line-clamp-2 text-neutral-800 group-hover/title:text-emerald-800 transition-colors duration-200">
            {product.name}
          </h3>
        </Link>

        {/* Price & Action Section */}
        <div className="mt-auto pt-3 flex flex-col gap-2.5 border-t border-neutral-100">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xl font-extrabold text-emerald-800 tracking-tight">{formatINR(product.price)}</span>
            </div>
            <Button 
              size="sm" 
              className="rounded-xl px-4 py-2 text-xs font-bold bg-emerald-800 hover:bg-emerald-900 text-white shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-1.5 active:scale-95" 
              onClick={handleAddToCart}
              disabled={addToCartMutation.isPending}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              {addToCartMutation.isPending ? '...' : 'Add to Cart'}
            </Button>
          </div>

          <button
            onClick={handleBuyNow}
            disabled={addToCartMutation.isPending}
            className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl transition-all duration-300 shadow-sm hover:shadow-md active:scale-98 flex items-center justify-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            Buy Now (1-Click)
          </button>
        </div>
      </div>
    </div>
  );
}
