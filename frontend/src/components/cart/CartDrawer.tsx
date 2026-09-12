import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Truck, Lock } from 'lucide-react';
import { useCartDrawerStore } from '../../store/useCartDrawerStore';
import { useCart, useUpdateCartItem, useRemoveCartItem } from '../../hooks/useCart';

export function CartDrawer() {
  const { isOpen, closeDrawer } = useCartDrawerStore();
  const { data: cart, isLoading } = useCart();
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();
  const navigate = useNavigate();

  if (!isOpen || typeof document === 'undefined') return null;

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

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      {/* Backdrop with Backdrop Blur */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn" 
        onClick={closeDrawer} 
      />

      {/* Centered Animated Modal Panel - Solid Opaque White */}
      <div 
        className="relative w-full max-w-lg max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col border border-emerald-900/20 overflow-hidden z-10 transform transition-all duration-300 animate-fade-in-up text-neutral-900"
        style={{ backgroundColor: '#ffffff' }}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between bg-emerald-950 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 text-amber-300 flex items-center justify-center shadow-xs border border-white/10">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-white leading-none">Your Cart</h2>
              <span className="text-[11px] font-semibold text-emerald-200 mt-1 block">
                {items.reduce((acc: number, item: any) => acc + item.quantity, 0)} items selected
              </span>
            </div>
          </div>
          <button 
            onClick={closeDrawer}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all active:scale-90"
            title="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Delivery Info Banner */}
        <div className="p-3 sm:p-3.5 bg-emerald-50/90 border-b border-emerald-900/10 flex items-center justify-between text-xs font-semibold text-neutral-800 shrink-0">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-800 shrink-0" />
            <span>🎉 <strong className="text-emerald-900">FREE Delivery</strong> on all Online Prepaid Orders!</span>
          </div>
          <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Shiprocket</span>
        </div>

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-neutral-50" style={{ backgroundColor: '#fafafa' }}>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-3">
              <div className="w-8 h-8 border-3 border-emerald-800 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-neutral-600 font-medium">Loading your cart...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 flex items-center justify-center text-emerald-800 shadow-inner">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-neutral-900">Your cart is empty</h3>
                <p className="text-xs text-neutral-600 mt-1 max-w-xs leading-relaxed">
                  Start your zero-calorie journey with 100% natural Kosmico Monk Fruit Sweetener!
                </p>
              </div>
              <button
                onClick={() => {
                  closeDrawer();
                  navigate('/shop');
                }}
                className="px-6 py-2.5 bg-emerald-800 text-white font-bold text-xs rounded-xl hover:bg-emerald-900 transition-all shadow-md active:scale-95"
              >
                Shop Kosmico Monk Fruit (₹387)
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
                  className="group flex gap-3.5 p-3.5 bg-white border border-neutral-200 rounded-2xl shadow-xs hover:shadow-md hover:border-emerald-700/40 transition-all duration-200"
                  style={{ backgroundColor: '#ffffff' }}
                >
                  <div className="w-18 h-18 bg-neutral-100 border border-neutral-200 rounded-xl p-1 shrink-0 overflow-hidden">
                    <img 
                      src={imageSrc} 
                      alt={prod.name || 'Product'} 
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-serif font-bold text-xs sm:text-sm text-neutral-900 line-clamp-2 leading-snug">
                          {prod.name || 'Kosmico Monk Fruit Sweetener'}
                        </h4>
                        <button
                          onClick={() => removeCartItem.mutate({ productId: prod._id || item.product, variant: item.variant })}
                          className="text-neutral-400 hover:text-red-600 transition-colors p-1 active:scale-90"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {item.variant && (
                        <span className="inline-block text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md mt-1 border border-emerald-200">
                          {item.variant}
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-2.5">
                      <div className="flex items-center border border-neutral-200 rounded-xl bg-white shadow-xs">
                        <button
                          onClick={() => handleQuantityChange(prod._id || item.product, item.quantity, -1, item.variant)}
                          className="p-1.5 text-neutral-700 hover:text-emerald-800 transition-colors active:scale-90 disabled:opacity-40"
                          disabled={updateCartItem.isPending}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-neutral-900 min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(prod._id || item.product, item.quantity, 1, item.variant)}
                          className="p-1.5 text-neutral-700 hover:text-emerald-800 transition-colors active:scale-90 disabled:opacity-40"
                          disabled={updateCartItem.isPending}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-bold text-sm text-emerald-900">
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
          <div className="p-4 sm:p-5 border-t border-neutral-200 bg-white shadow-lg space-y-3 shrink-0" style={{ backgroundColor: '#ffffff' }}>
            <div className="flex justify-between items-center text-xs text-neutral-600 font-medium">
              <span>Subtotal (Taxes Included)</span>
              <span className="font-serif font-bold text-neutral-900 text-lg">₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-emerald-900 bg-emerald-50 p-2.5 rounded-xl font-semibold border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>100% Secure Checkout | Live Shiprocket Delivery</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={() => {
                  closeDrawer();
                  navigate('/cart');
                }}
                className="py-3 px-3 border border-neutral-300 text-neutral-800 font-bold text-xs rounded-xl hover:bg-neutral-100 transition-colors text-center"
              >
                View Full Cart
              </button>
              <button
                onClick={handleCheckout}
                className="py-3 px-3 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 uppercase tracking-wide"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>CHECKOUT</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>,
    document.body
  );
}

