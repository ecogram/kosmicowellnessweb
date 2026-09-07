import { Link } from 'react-router-dom';
import { useCart, useUpdateCartItem, useRemoveCartItem, useClearCart } from '../hooks/useCart';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { Trash2, ArrowRight } from 'lucide-react';
import { formatINR } from '../utils/currency';

export const Cart = () => {
  const { data: cart, isLoading } = useCart();
  const updateMutation = useUpdateCartItem();
  const removeMutation = useRemoveCartItem();
  const clearMutation = useClearCart();

  if (isLoading) {
    return <div className="py-32 text-center">Loading cart...</div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="py-32 text-center">
        <h2 className="text-3xl font-serif text-primary mb-4">Your cart is empty</h2>
        <Link to="/shop">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  const subtotal = cart.items.reduce((acc: number, item: any) => acc + (item.priceSnapshot * item.quantity), 0);

  return (
    <div className="bg-background min-h-screen py-12">
      <Container>
        <h1 className="font-serif text-4xl font-bold text-primary mb-8">Your Cart</h1>

        <div className="flex flex-col lg:flex-row gap-12">
          <div className="w-full lg:w-2/3">
            <div className="bg-surface rounded-2xl border border-border overflow-hidden">
              <div className="p-6 hidden sm:grid grid-cols-12 gap-4 border-b border-border bg-neutral-50/50">
                <div className="col-span-6 font-medium text-sm text-text-muted uppercase tracking-wider">Product</div>
                <div className="col-span-3 font-medium text-sm text-text-muted uppercase tracking-wider text-center">Quantity</div>
                <div className="col-span-2 font-medium text-sm text-text-muted uppercase tracking-wider text-right">Total</div>
                <div className="col-span-1"></div>
              </div>
              
              <ul className="divide-y divide-border">
                {cart.items.map((item: any) => {
                  const prod = typeof item.product === 'object' && item.product !== null ? item.product : {};
                  const productId = prod._id || (typeof item.product === 'string' ? item.product : '');
                  const imageSrc = Array.isArray(prod.images) && prod.images.length > 0 
                    ? prod.images[0] 
                    : '/assets/products/product-box.jpg';
                  const productName = prod.name || 'Kosmico Classic Monk Fruit Sweetener (250ml)';
                  const productSlug = prod.slug || 'kosmico-classic-monk-fruit-sweetener-250g';

                  return (
                    <li key={`${productId}-${item.variant || 'default'}`} className="p-6 flex flex-col sm:grid sm:grid-cols-12 gap-6 items-center">
                      <div className="col-span-6 flex items-center gap-4 w-full">
                        <div className="w-24 h-24 bg-background rounded-lg border border-border p-2 flex-shrink-0">
                          <img 
                            src={imageSrc} 
                            alt={productName}
                            className="w-full h-full object-contain mix-blend-multiply"
                          />
                        </div>
                        <div>
                          <Link to={`/products/${productSlug}`} className="font-serif font-bold text-lg hover:text-primary transition-colors line-clamp-2">
                            {productName}
                          </Link>
                          {item.variant && <div className="text-sm text-text-main mt-1">Size: {item.variant}</div>}
                          <div className="text-sm text-text-muted mt-1">{formatINR(item.priceSnapshot)}</div>
                        </div>
                      </div>
                      
                      <div className="col-span-3 flex justify-center w-full sm:w-auto">
                        <div className="flex items-center border border-border rounded-full overflow-hidden bg-background w-32">
                          <button
                            onClick={() => updateMutation.mutate({ productId, quantity: Math.max(1, item.quantity - 1), variant: item.variant })}
                            disabled={updateMutation.isPending}
                            className="w-10 h-10 flex items-center justify-center hover:bg-neutral-100 transition-colors"
                          >
                            -
                          </button>
                          <span className="flex-1 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateMutation.mutate({ productId, quantity: item.quantity + 1, variant: item.variant })}
                            disabled={updateMutation.isPending}
                            className="w-10 h-10 flex items-center justify-center hover:bg-neutral-100 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="col-span-2 text-right font-bold text-lg w-full sm:w-auto text-center sm:text-right">
                        {formatINR(item.priceSnapshot * item.quantity)}
                      </div>

                      <div className="col-span-1 flex justify-end w-full sm:w-auto">
                        <button 
                          onClick={() => removeMutation.mutate({ productId, variant: item.variant })}
                          disabled={removeMutation.isPending}
                          className="text-text-muted hover:text-error transition-colors p-2"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
            
            <div className="mt-6 flex justify-between items-center">
              <Link to="/shop" className="text-primary font-medium hover:underline">
                Continue Shopping
              </Link>
              <button 
                onClick={() => clearMutation.mutate()} 
                disabled={clearMutation.isPending}
                className="text-text-muted text-sm hover:text-error hover:underline transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>

          <div className="w-full lg:w-1/3">
            <div className="bg-surface rounded-2xl border border-border p-8 sticky top-24 shadow-sm">
              <h2 className="font-serif text-2xl font-bold mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 text-text-main">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-sm text-text-muted">Calculated at checkout</span>
                </div>
              </div>
              
              <div className="border-t border-border pt-6 mb-8">
                <div className="flex justify-between items-end">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-serif font-bold text-3xl text-primary">{formatINR(subtotal)}</span>
                </div>
              </div>
              
              <Link to="/checkout" className="block">
                <Button className="w-full py-4 text-lg rounded-full flex justify-center items-center group">
                  Checkout <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};
