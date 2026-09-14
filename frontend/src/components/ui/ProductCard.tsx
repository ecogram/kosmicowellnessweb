import { formatINR } from '../../utils/currency';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './Button';
import { Star, Heart, ShoppingBag, Zap } from 'lucide-react';
import { useAddToCart } from '../../hooks/useCart';
import { useToggleWishlist, useWishlist } from '../../hooks/useWishlist';

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
  const navigate = useNavigate();
  const addToCartMutation = useAddToCart();
  const toggleWishlistMutation = useToggleWishlist();
  const { data: wishlist } = useWishlist();

  const productId = product.id || (product as any)._id;
  const isWishlisted = wishlist?.items?.some((item: any) => {
    const itemId = typeof item === 'string' ? item : (item?._id || item?.id);
    return itemId?.toString() === productId?.toString();
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCartMutation.mutate({ 
      productId: productId, 
      quantity: 1,
      name: product.name,
      price: product.price,
      image: product.image
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlistMutation.mutate({
      _id: productId,
      id: productId,
      name: product.name,
      slug: product.slug,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      image: product.image,
    });
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCartMutation.mutateAsync({ 
      productId: productId, 
      quantity: 1,
      name: product.name,
      price: product.price,
      image: product.image
    });
    navigate('/checkout');
  };

  return (
    <div className="group relative bg-white border border-emerald-950/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-emerald-950/10 hover:border-emerald-600/40 transition-all duration-300 flex flex-col h-full">
      {/* Light sweep ambient glow effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500 bg-gradient-to-tr from-emerald-500/5 via-transparent to-amber-500/5 z-0" />

      {/* Wishlist Button */}
      <button 
        type="button"
        onClick={handleToggleWishlist}
        disabled={toggleWishlistMutation.isPending}
        className={`absolute top-3.5 right-3.5 z-20 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 shadow-md hover:scale-110 disabled:opacity-50 cursor-pointer ${
          isWishlisted 
            ? 'bg-rose-50 text-rose-600 border border-rose-200' 
            : 'bg-white/90 hover:bg-white text-neutral-400 hover:text-rose-500'
        }`}
        title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        aria-label="Wishlist"
      >
        <Heart className={`w-4 h-4 transition-transform duration-200 ${isWishlisted ? 'fill-rose-500 text-rose-500 scale-110' : ''}`} />
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
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-xl font-black text-emerald-800 tracking-tight font-sans">
                {formatINR(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <>
                  <span className="text-xs text-neutral-400 line-through font-sans">
                    {formatINR(product.compareAtPrice)}
                  </span>
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                    {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF
                  </span>
                </>
              )}
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
