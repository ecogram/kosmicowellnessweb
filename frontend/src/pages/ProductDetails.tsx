import { formatINR } from '../utils/currency';
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { Star, ShieldCheck, ArrowLeft, Heart, Zap, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { useProduct } from '../hooks/useProducts';
import { useAddToCart } from '../hooks/useCart';
import { useToggleWishlist, useWishlist } from '../hooks/useWishlist';
import { useAuthStore } from '../store/useAuthStore';
import { ProductReviews } from '../components/reviews/ProductReviews';
import { VisualBundles, type BundleOption } from '../components/product/VisualBundles';
import { PincodeEstimator } from '../components/product/PincodeEstimator';
import toast from 'react-hot-toast';

export function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { data: product, isLoading, isError } = useProduct(slug as string);
  const addToCartMutation = useAddToCart();
  const toggleWishlistMutation = useToggleWishlist();
  const { data: wishlist } = useWishlist();

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string>('/assets/products/product-box.jpg');
  const [selectedBundleId, setSelectedBundleId] = useState<string>('single');
  const [selectedBundle, setSelectedBundle] = useState<BundleOption | null>(null);

  useEffect(() => {
    if (product?.images?.length) {
      setActiveImage(product.images[0]);
    }
  }, [product]);

  if (isLoading) {
    return <div className="py-32 text-center text-text-muted font-medium">Loading Sweet Monk Sweetener...</div>;
  }

  if (isError || !product) {
    return (
      <div className="py-32 text-center">
        <h2 className="text-2xl font-serif text-primary mb-4">Product not found</h2>
        <Link to="/shop">
          <Button>Back to Shop</Button>
        </Link>
      </div>
    );
  }

  const images = product.images?.length
    ? product.images
    : ['/assets/products/product-box.jpg', '/assets/products/product-front-back.jpg', '/assets/products/lifestyle-tea.jpg'];

  const isWishlisted = wishlist?.items?.some((item: any) => {
    const itemId = typeof item === 'string' ? item : (item?._id || item?.id);
    const currentId = product._id || product.id;
    return itemId?.toString() === currentId?.toString();
  });

  const singlePrice = product.price;
  const displayPrice = selectedBundle
    ? (selectedBundle.id === 'single' ? singlePrice : selectedBundle.price)
    : singlePrice;
  const bundleQuantity = selectedBundle ? selectedBundle.quantity : 1;
  const compareAtPrice = (product.compareAtPrice || 499) * bundleQuantity;
  const stock = typeof product.stock === 'number' ? product.stock : 50;
  const isOutOfStock = stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error('This product is currently out of stock');
      return;
    }
    const activeBundle = selectedBundle || {
      id: 'single',
      name: 'Single Pack (10ml Bottle)',
      quantity: 1,
      price: singlePrice,
      unitPrice: `₹${singlePrice} / pack`
    };
    const totalQtyToAdd = activeBundle.quantity * quantity;
    if (totalQtyToAdd > stock) {
      toast.error(`Only ${stock} items available in stock`);
      return;
    }
    const variantStr = activeBundle.name;
    const finalPrice = activeBundle.id === 'single' ? singlePrice : activeBundle.price;

    addToCartMutation.mutate({
      productId: product._id || product.id,
      quantity: totalQtyToAdd,
      variant: variantStr,
      price: finalPrice,
      name: product.name,
      image: images[0],
      stock: stock,
    });
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) {
      toast.error('This product is currently out of stock');
      return;
    }
    const activeBundle = selectedBundle || {
      id: 'single',
      name: 'Single Pack (10ml Bottle)',
      quantity: 1,
      price: singlePrice,
      unitPrice: `₹${singlePrice} / pack`
    };
    const totalQtyToAdd = activeBundle.quantity * quantity;
    if (totalQtyToAdd > stock) {
      toast.error(`Only ${stock} items available in stock`);
      return;
    }
    const variantStr = activeBundle.name;
    const finalPrice = activeBundle.id === 'single' ? singlePrice : activeBundle.price;

    await addToCartMutation.mutateAsync({
      productId: product._id || product.id,
      quantity: totalQtyToAdd,
      variant: variantStr,
      price: finalPrice,
      name: product.name,
      image: images[0],
      stock: stock,
    });
    navigate('/checkout');
  };

  const handleToggleWishlist = async () => {
    if (!product) return;

    if (!isAuthenticated) {
      toast.error('Please login to save items to your wishlist');
      return;
    }

    try {
      const res = await toggleWishlistMutation.mutateAsync({
        _id: product._id || product.id,
        id: product._id || product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        compareAtPrice: product.compareAtPrice || 499,
        image: product.image || (product.images?.length ? product.images[0] : '/assets/products/product-box.jpg'),
      });

      if (res?.action === 'added') {
        toast.success('Added to wishlist');
      } else if (res?.action === 'removed') {
        toast.success('Removed from wishlist');
      }
    } catch (err) {
      console.warn('Toggle wishlist notice:', err);
    }
  };

  return (
    <div className="py-12 bg-background min-h-[90vh]">
      <Container>
        <Link
          to="/shop"
          className="inline-flex items-center text-sm font-medium text-text-muted hover:text-primary mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Shop
        </Link>

        <div className="flex flex-col md:flex-row gap-10 lg:gap-14 mb-16 items-start">
          {/* Gallery */}
          <div className="w-full md:w-1/2 md:sticky md:top-28">
            <div className="aspect-square bg-surface rounded-3xl border border-border p-8 mb-4 flex items-center justify-center overflow-hidden shadow-xs">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-contain mix-blend-multiply hover:scale-105 transition-transform duration-500"
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`aspect-square rounded-2xl border-2 p-2 bg-surface overflow-hidden transition-all cursor-pointer ${activeImage === img ? 'border-primary shadow-xs ring-2 ring-primary/20' : 'border-border hover:border-text-muted'
                      }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                  </button>
                ))}
              </div>
            )}

            {/* Erythritol Free Trust Box */}
            <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider">100% Erythritol-Free Guarantee</h4>
                <p className="text-xs text-text-main mt-0.5 leading-relaxed">
                  Kosmico Sweet Monk is guaranteed <strong>zero sugar alcohols</strong>, preventing digestive bloating or stomach discomfort.
                </p>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="w-full md:w-1/2 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-accent text-white text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                100% Natural Sweet Monk
              </span>
            </div>

            <h1 className="font-serif text-3xl lg:text-4xl font-bold text-primary mb-3 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-5">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(product.rating || 5) ? 'text-accent fill-accent' : 'text-border fill-border'}`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-text-main underline cursor-pointer hover:text-primary transition-colors">
                {product.reviewsCount || product.numReviews || 289} verified Indian buyer reviews
              </span>
            </div>

            <div className="flex items-baseline gap-3 mb-6 p-4 bg-surface rounded-2xl border border-border flex-wrap">
              <span className="text-3xl font-black text-primary font-sans">{formatINR(displayPrice)}</span>
              {compareAtPrice > displayPrice && (
                <>
                  <span className="text-base text-neutral-400 line-through font-sans">
                    {formatINR(compareAtPrice)}
                  </span>
                  <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                    {Math.round(((compareAtPrice - displayPrice) / compareAtPrice) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Real Database Stock Status */}
            <div className="flex items-center gap-2 mb-4">
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  Out of Stock
                </span>
              ) : stock <= 5 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Only {stock} items left in stock — Order soon
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  In Stock ({stock} available) • Ready to Dispatch
                </span>
              )}
            </div>

            <p className="text-text-main text-sm md:text-base mb-6 leading-relaxed">
              {product.description}
            </p>

            {/* Visual Pack Bundles Component */}
            <VisualBundles
              basePrice={product.price}
              selectedBundleId={selectedBundleId}
              onSelectBundle={(bundle) => {
                setSelectedBundleId(bundle.id);
                setSelectedBundle(bundle);
              }}
            />

            {/* Delivery Pincode Checker Component */}
            <PincodeEstimator />

            <div className="bg-surface rounded-2xl p-5 border border-border my-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-xs uppercase text-text-main tracking-wider">Select Packs Quantity</span>
                <div className="flex items-center border border-border rounded-xl overflow-hidden bg-background">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={isOutOfStock}
                    className="w-9 h-9 flex items-center justify-center text-text-main hover:bg-neutral-100 transition-colors font-bold text-base disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-sm">{quantity}</span>
                  <button
                    onClick={() => {
                      if (quantity + 1 > stock) {
                        toast.error(stock === 0 ? 'Product is out of stock' : `Only ${stock} items available in stock`);
                        return;
                      }
                      setQuantity(quantity + 1);
                    }}
                    disabled={quantity >= stock || isOutOfStock}
                    className="w-9 h-9 flex items-center justify-center text-text-main hover:bg-neutral-100 transition-colors font-bold text-base disabled:opacity-40"
                    title={quantity >= stock ? `Max available stock reached (${stock})` : 'Increase quantity'}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons: Add to Cart + Buy Now */}
              <div className="space-y-3">
                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={addToCartMutation.isPending || isOutOfStock}
                    className={`flex-1 py-3.5 px-5 font-bold text-sm rounded-xl transition-all shadow-sm ${
                      isOutOfStock
                        ? 'bg-neutral-100 text-neutral-400 border border-neutral-300 cursor-not-allowed shadow-none'
                        : 'border-2 border-primary text-primary hover:bg-primary/5 cursor-pointer'
                    }`}
                  >
                    {isOutOfStock ? 'Out of Stock' : addToCartMutation.isPending ? 'Adding to Cart...' : 'Add to Cart'}
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleWishlist}
                    disabled={toggleWishlistMutation.isPending}
                    className={`w-12 h-12 flex items-center justify-center border rounded-xl transition-all shrink-0 cursor-pointer shadow-xs active:scale-95 disabled:opacity-50 ${isWishlisted
                        ? 'bg-rose-50 border-rose-300 text-rose-600 shadow-rose-100'
                        : 'border-border bg-background hover:bg-neutral-100 text-text-main hover:text-rose-500'
                      }`}
                    title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                    aria-label="Toggle Wishlist"
                  >
                    <Heart className={`w-5 h-5 transition-transform duration-200 ${isWishlisted ? 'fill-rose-500 text-rose-500 scale-110' : ''}`} />
                  </button>
                </div>

                {/* Direct 1-Click Buy Now CTA */}
                <button
                  onClick={handleBuyNow}
                  disabled={addToCartMutation.isPending || isOutOfStock}
                  className={`w-full py-4 px-6 font-extrabold text-base rounded-xl transition-all flex items-center justify-center gap-2 ${
                    isOutOfStock
                      ? 'bg-neutral-200 text-neutral-500 shadow-none cursor-not-allowed'
                      : 'bg-accent text-white hover:bg-accent/90 shadow-lg shadow-accent/20 cursor-pointer'
                  }`}
                >
                  <Zap className={`w-5 h-5 ${isOutOfStock ? 'fill-neutral-400' : 'fill-white'}`} />
                  <span>{isOutOfStock ? 'Out of Stock' : 'BUY NOW (1-Click Express Checkout)'}</span>
                </button>
              </div>
            </div>

            {/* Health Trust Badges */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 bg-surface-secondary/60 rounded-xl border border-border flex items-center gap-2 text-xs font-semibold text-text-main">
                <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                <span>Zero Glycemic Index (0 Spikes)</span>
              </div>
              <div className="p-3 bg-surface-secondary/60 rounded-xl border border-border flex items-center gap-2 text-xs font-semibold text-text-main">
                <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                <span>PCOS & Diabetes Safe</span>
              </div>
              <div className="p-3 bg-surface-secondary/60 rounded-xl border border-border flex items-center gap-2 text-xs font-semibold text-text-main">
                <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                <span>1:1 Sugar Heat Substitution</span>
              </div>
              <div className="p-3 bg-surface-secondary/60 rounded-xl border border-border flex items-center gap-2 text-xs font-semibold text-text-main">
                <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
                <span>100% Money-Back Guarantee</span>
              </div>
            </div>
          </div>
        </div>

        <ProductReviews productId={product._id} />
      </Container>
    </div>
  );
}

