import { useEffect } from 'react';
import { formatINR } from '../utils/currency';
import { Link } from 'react-router-dom';
import { useWishlist, useToggleWishlist } from '../hooks/useWishlist';
import { Container } from '../components/ui/Container';
import { Trash2, ShoppingCart, HeartCrack, Heart, ArrowRight, User } from 'lucide-react';
import { useAddToCart } from '../hooks/useCart';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

export function Wishlist() {
  const { isAuthenticated } = useAuthStore();
  const { data: wishlist, isLoading, refetch } = useWishlist();
  const toggleMutation = useToggleWishlist();
  const addToCartMutation = useAddToCart();

  useEffect(() => {
    if (isAuthenticated) {
      refetch();
    }
  }, [isAuthenticated, refetch]);

  if (!isAuthenticated) {
    return (
      <Container className="py-20 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center mb-5 shadow-sm border border-rose-100">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-emerald-950 mb-3">Save Your Favourite Items</h2>
        <p className="text-neutral-600 mb-8 text-sm">Please log in to your Kosmico Wellness account to view and manage your saved wishlist items.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link 
            to="/login" 
            className="w-full sm:w-auto px-8 py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <User className="w-4 h-4" />
            <span>Log In / Sign Up</span>
          </Link>
          <Link 
            to="/shop" 
            className="w-full sm:w-auto px-6 py-3 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 rounded-xl font-bold text-sm transition-all"
          >
            Browse Shop
          </Link>
        </div>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container className="py-12 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-200 w-48 mb-8 rounded-lg"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 bg-neutral-100 rounded-2xl border border-neutral-200"></div>
          ))}
        </div>
      </Container>
    );
  }

  const items = wishlist?.items || [];

  if (items.length === 0) {
    return (
      <Container className="py-20 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-full bg-neutral-100 text-neutral-400 mx-auto flex items-center justify-center mb-5">
          <HeartCrack className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-emerald-950 mb-3">Your Wishlist is Empty</h2>
        <p className="text-neutral-600 mb-8 text-sm">Save items you love by tapping the heart icon on any product to review them later.</p>
        <Link 
          to="/shop" 
          className="inline-flex items-center gap-2 bg-emerald-800 text-white px-8 py-3 rounded-xl hover:bg-emerald-900 transition-all font-bold text-sm shadow-md hover:shadow-lg"
        >
          <span>Explore Wellness Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
            <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-emerald-950">Your Wishlist</h1>
            <p className="text-xs text-neutral-500 font-medium mt-0.5">{items.length} saved item{items.length === 1 ? '' : 's'}</p>
          </div>
        </div>
        <Link 
          to="/shop" 
          className="text-xs font-bold text-emerald-800 hover:text-emerald-950 hover:underline flex items-center gap-1"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      
      <div className="grid gap-4">
        {items.map((item: any) => {
          // Backend populates items as Product objects
          const product = item?.product || item;
          if (!product || (!product._id && !product.id && !product.name)) return null;
          
          const prodId = product._id || product.id;
          const prodImage = product.image || (product.images?.length ? product.images[0] : '/assets/products/product-box.jpg');
          const prodSlug = product.slug || prodId;
          const prodPrice = product.price;
          const prodStock = typeof product.stock === 'number' ? product.stock : 50;
          const isOutOfStock = prodStock <= 0;

          return (
            <div 
              key={prodId} 
              className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-xs hover:shadow-md transition-all"
            >
              <Link to={`/products/${prodSlug}`} className="shrink-0 w-24 h-24 sm:w-28 sm:h-28 bg-neutral-50 rounded-xl p-2 border border-neutral-100 flex items-center justify-center overflow-hidden group">
                <img 
                  src={prodImage} 
                  alt={product.name}
                  className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                />
              </Link>
              
              <div className="flex-1 text-center sm:text-left min-w-0">
                <Link 
                  to={`/products/${prodSlug}`} 
                  className="text-base sm:text-lg font-bold text-neutral-900 hover:text-emerald-800 transition-colors line-clamp-1"
                >
                  {product.name}
                </Link>
                <div className="text-emerald-800 font-extrabold text-lg mt-1">
                  {formatINR(prodPrice)}
                </div>
                {isOutOfStock ? (
                  <div className="text-xs text-rose-600 font-bold mt-1 flex items-center justify-center sm:justify-start gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                    Out of Stock
                  </div>
                ) : prodStock <= 5 ? (
                  <div className="text-xs text-amber-700 font-bold mt-1 flex items-center justify-center sm:justify-start gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    Only {prodStock} left in stock - Order Soon
                  </div>
                ) : (
                  <div className="text-xs text-emerald-700 font-medium mt-1 flex items-center justify-center sm:justify-start gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    In Stock • Ready to Dispatch
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-center sm:justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                <button
                  type="button"
                  onClick={() => {
                    if (isOutOfStock) {
                      toast.error('Product is out of stock');
                      return;
                    }
                    addToCartMutation.mutate({ 
                      productId: prodId, 
                      quantity: 1,
                      name: product.name,
                      price: prodPrice,
                      image: prodImage,
                      stock: prodStock,
                    });
                  }}
                  disabled={addToCartMutation.isPending || isOutOfStock}
                  className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl transition-all font-bold text-xs shadow-xs disabled:opacity-50 active:scale-95 ${
                    isOutOfStock 
                      ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed' 
                      : 'bg-emerald-800 text-white hover:bg-emerald-900 cursor-pointer'
                  }`}
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>{isOutOfStock ? 'Out of Stock' : addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => toggleMutation.mutate(prodId)}
                  disabled={toggleMutation.isPending}
                  className="p-2.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-50 cursor-pointer border border-transparent hover:border-rose-200"
                  title="Remove from wishlist"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Container>
  );
}
