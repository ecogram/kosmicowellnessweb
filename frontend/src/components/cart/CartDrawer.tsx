import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Truck, Sparkles, Lock } from 'lucide-react';
import { useCartDrawerStore } from '../../store/useCartDrawerStore';
import { useCart, useUpdateCartItem, useRemoveCartItem } from '../../hooks/useCart';

const FREE_SHIPPING_THRESHOLD = 499;

export function CartDrawer() {
  const { isOpen, closeDrawer } = useCartDrawerStore();
  const { data: cart, isLoading } = useCart();
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const items = cart?.items || [];
  
  const getItemPrice = (item: any) => {
    if (typeof item.price === 'number' && !isNaN(item.price) && item.price > 0) return item.price;
    if (typeof item.priceSnapshot === 'number' && !isNaN(item.priceSnapshot) && item.priceSnapshot > 0) return item.priceSnapshot;
    if (item.product && typeof item.product === 'object' && typeof item.product.price === 'number' && !isNaN(item.product.price) && item.product.price > 0) {
      return item.product.price;
    }
    return 387; // Fallback default product price
  };

  const totalAmount = items.reduce((acc: number, item: any) => acc + (getItemPrice(item) * (item.quantity || 1)), 0);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - totalAmount);
  const freeShippingProgress = FREE_SHIPPING_THRESHOLD > 0 ? Math.min(100, (totalAmount / FREE_SHIPPING_THRESHOLD) * 100) : 100;

  const handleQuantityChange = (productId: string, currentQty: number, change: number, variant?: string) => {
    const newQty = currentQty + change;
    if (newQty <= 0) {
      removeCartItem.mutate({ productId, variant });
    } else {
      updateCartItem.mutate({ productId, quantity: newQty, variant });
    }
  };

  const handleCheckout = () => {
    closeDrawer();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Backdrop with Backdrop Blur */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 animate-fadeIn" 
        onClick={closeDrawer} 
      />

      {/* Centered Animated Modal Panel */}
      <div className="relative w-full max-w-lg max-h-[85vh] bg-surface rounded-3xl shadow-2xl flex flex-col border border-emerald-900/20 overflow-hidden z-10 transform transition-all duration-300 animate-fade-in-up">
          
          {/* Header */}
          <div className="p-5 border-b border-border flex items-center justify-between bg-gradient-to-r from-surface to-surface-secondary">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-text-main leading-none">Your Cart</h2>
                <span className="text-[11px] font-semibold text-text-muted mt-0.5 block">
                  {items.reduce((acc: number, item: any) => acc + item.quantity, 0)} items selected
                </span>
              </div>
            </div>
            <button 
              onClick={closeDrawer}
              className="p-2 rounded-xl text-text-muted hover:text-text-main hover:bg-border/50 transition-all active:scale-90"
              title="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="p-4 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border-b border-border/80 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-semibold text-text-main mb-2">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-primary animate-bounce" />
                {remainingForFreeShipping > 0 ? (
                  <>Add <strong className="text-primary font-bold">₹{remainingForFreeShipping}</strong> more for FREE Express Shipping!</>
                ) : (
                  <span className="text-green-700 font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                    🎉 You've unlocked FREE Express Delivery!
                  </span>
                )}
              </span>
              <span className="font-extrabold text-xs text-primary">{Math.round(freeShippingProgress)}%</span>
            </div>
            <div className="w-full h-2.5 bg-border/60 rounded-full overflow-hidden p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-primary via-accent to-emerald-500 transition-all duration-700 rounded-full shadow-xs"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-background/50">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-48 space-y-3">
                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-text-muted font-medium">Loading your cart...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-72 text-center space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-text-main">Your cart is empty</h3>
                  <p className="text-xs text-text-muted mt-1 max-w-xs leading-relaxed">
                    Start your zero-calorie journey with 100% natural Kosmico Monk Fruit Sweetener!
                  </p>
                </div>
                <button
                  onClick={() => {
                    closeDrawer();
                    navigate('/shop');
                  }}
                  className="px-6 py-3 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary-dark transition-all shadow-md active:scale-95"
                >
                  Shop Kosmiko Monk Fruit (₹387)
                </button>
              </div>
            ) : (
              items.map((item: any) => {
                const prod = item.product || {};
                const imageSrc = Array.isArray(prod.images) && prod.images.length > 0 
                  ? prod.images[0] 
                  : '/assets/products/product-box.jpg';

                return (
                  <div 
                    key={`${prod._id || item.product}-${item.variant || 'default'}`}
                    className="group flex gap-3.5 p-3.5 bg-surface border border-border rounded-2xl shadow-xs hover:shadow-md hover:border-primary/40 transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    <div className="w-20 h-20 bg-surface-secondary border border-border rounded-xl p-1.5 shrink-0 overflow-hidden">
                      <img 
                        src={imageSrc} 
                        alt={prod.name || 'Product'} 
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-serif font-bold text-xs sm:text-sm text-text-main line-clamp-2 leading-snug">
                            {prod.name || 'Kosmiko Monk Fruit Sweetener'}
                          </h4>
                          <button
                            onClick={() => removeCartItem.mutate({ productId: prod._id || item.product, variant: item.variant })}
                            className="text-text-muted hover:text-error transition-colors p-1 active:scale-90"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {item.variant && (
                          <span className="inline-block text-[10px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-md mt-1">
                            {item.variant}
                          </span>
                        )}
                      </div>

                      <div className="flex justify-between items-center mt-2.5">
                        <div className="flex items-center border border-border rounded-xl bg-surface shadow-xs">
                          <button
                            onClick={() => handleQuantityChange(prod._id || item.product, item.quantity, -1, item.variant)}
                            className="p-1.5 text-text-main hover:text-primary transition-colors active:scale-90 disabled:opacity-40"
                            disabled={updateCartItem.isPending}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-text-main min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(prod._id || item.product, item.quantity, 1, item.variant)}
                            className="p-1.5 text-text-main hover:text-primary transition-colors active:scale-90 disabled:opacity-40"
                            disabled={updateCartItem.isPending}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-bold text-sm text-primary">
                          ₹{(getItemPrice(item) * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Checkout Summary */}
          {items.length > 0 && (
            <div className="p-5 border-t border-border bg-surface shadow-lg space-y-3.5">
              <div className="flex justify-between items-center text-xs text-text-muted font-medium">
                <span>Subtotal (Taxes Included)</span>
                <span className="font-serif font-bold text-text-main text-lg">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-green-700 bg-green-500/10 p-2.5 rounded-xl font-semibold border border-green-500/20">
                <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
                <span>100% Secure Checkout | Free Return Guarantee</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={() => {
                    closeDrawer();
                    navigate('/cart');
                  }}
                  className="py-3 px-4 border border-border text-text-main font-bold text-xs rounded-xl hover:bg-surface-secondary transition-colors text-center"
                >
                  View Full Cart
                </button>
                <button
                  onClick={handleCheckout}
                  className="py-3.5 px-4 bg-accent text-white font-extrabold text-xs rounded-xl hover:bg-accent/90 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-accent/20 active:scale-95"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>CHECKOUT NOW</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
    </div>
  );
}

