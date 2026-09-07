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

export function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading, isError } = useProduct(slug as string);
  const { isAuthenticated } = useAuthStore();
  const addToCartMutation = useAddToCart();
  const toggleWishlistMutation = useToggleWishlist();
  const { data: wishlist } = useWishlist();

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState('/assets/products/product-box.jpg');
  const [selectedBundleId, setSelectedBundleId] = useState<string>('single');
  const [selectedBundle, setSelectedBundle] = useState<BundleOption | null>(null);

  useEffect(() => {
    if (product?.images?.length) {
      setActiveImage(product.images[0]);
    }
  }, [product]);

  if (isLoading) {
    return <div className="py-32 text-center text-text-muted font-medium">Loading Kosmico Monk Fruit Sweetener...</div>;
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

  const isWishlisted = wishlist?.items?.some((item: any) => 
    (typeof item === 'string' ? item : item._id) === product._id
  );

  const displayPrice = selectedBundle ? selectedBundle.price : product.price;

  const handleAddToCart = () => {
    if (!isAuthenticated) return navigate('/login');
    const packVariantName = selectedBundle ? selectedBundle.name : '250ml Bottle';
    addToCartMutation.mutate({ 
      productId: product._id, 
      quantity: selectedBundle ? selectedBundle.quantity * quantity : quantity, 
      variant: packVariantName 
    });
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) return navigate('/login');
    const packVariantName = selectedBundle ? selectedBundle.name : '250ml Bottle';
    await addToCartMutation.mutateAsync({ 
      productId: product._id, 
      quantity: selectedBundle ? selectedBundle.quantity * quantity : quantity, 
      variant: packVariantName 
    });
    navigate('/checkout');
  };

  const handleToggleWishlist = () => {
    if (!isAuthenticated) return navigate('/login');
    toggleWishlistMutation.mutate(product._id);
  };

  return (
    <div className="bg-background min-h-screen py-12">
      <Container>
        <Link
          to="/shop"
          className="inline-flex items-center text-text-muted hover:text-primary mb-8 transition-colors font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Shop
        </Link>

        <div className="flex flex-col md:flex-row gap-12 lg:gap-16 mb-20">
          {/* Gallery */}
          <div className="w-full md:w-1/2">
            <div className="bg-surface border border-border rounded-3xl p-8 aspect-square flex items-center justify-center mb-6 sticky top-24 shadow-md">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-contain mix-blend-multiply transition-all duration-300"
              />
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`flex-shrink-0 w-20 h-20 bg-surface border-2 rounded-2xl overflow-hidden p-2 transition-all ${activeImage === img ? 'border-primary shadow-sm scale-105' : 'border-border hover:border-primary/50'}`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${i}`}
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </button>
              ))}
            </div>

            {/* Erythritol Free Trust Box */}
            <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider">100% Erythritol-Free Guarantee</h4>
                <p className="text-xs text-text-main mt-0.5 leading-relaxed">
                  Kosmico Monk Fruit is guaranteed <strong>zero sugar alcohols</strong>, preventing digestive bloating or stomach discomfort.
                </p>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="w-full md:w-1/2 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-accent text-white text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                100% Natural Monk Fruit
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

            <div className="flex items-baseline gap-3 mb-6 p-4 bg-surface rounded-2xl border border-border">
              <span className="text-3xl font-bold text-primary">{formatINR(displayPrice)}</span>
              <span className="text-xs font-semibold text-green-700 bg-green-500/10 px-2 py-1 rounded-md ml-auto">
                Taxes included | Free Shipping ₹499+
              </span>
            </div>

            <p className="text-text-main text-sm md:text-base mb-6 leading-relaxed">
              {product.description}
            </p>

            {/* Visual Pack Bundles Component */}
            <VisualBundles
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
                    className="w-9 h-9 flex items-center justify-center text-text-main hover:bg-neutral-100 transition-colors font-bold text-base"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-9 h-9 flex items-center justify-center text-text-main hover:bg-neutral-100 transition-colors font-bold text-base"
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
                    disabled={addToCartMutation.isPending}
                    className="flex-1 py-3.5 px-5 border-2 border-primary text-primary font-bold text-sm rounded-xl hover:bg-primary/5 transition-all shadow-sm"
                  >
                    {addToCartMutation.isPending ? 'Adding to Cart...' : 'Add to Cart'}
                  </button>

                  <button 
                    onClick={handleToggleWishlist}
                    disabled={toggleWishlistMutation.isPending}
                    className="w-12 h-12 flex items-center justify-center border border-border rounded-xl bg-background hover:bg-neutral-100 transition-colors shrink-0"
                    title="Add to Wishlist"
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-text-main'}`} />
                  </button>
                </div>

                {/* Direct 1-Click Buy Now CTA */}
                <button
                  onClick={handleBuyNow}
                  disabled={addToCartMutation.isPending}
                  className="w-full py-4 px-6 bg-accent text-white font-extrabold text-base rounded-xl hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5 fill-white" />
                  <span>BUY NOW (1-Click Express Checkout)</span>
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

