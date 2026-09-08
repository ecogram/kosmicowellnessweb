import { formatINR } from '../utils/currency';
import { useParams, Link } from 'react-router-dom';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { useOrder, useCancelOrder } from '../hooks/useOrders';
import { useCreatePayment, useVerifyPayment } from '../hooks/usePayments';
import { useAuthStore } from '../store/useAuthStore';
import { useSocket } from '../hooks/useSocket';
import { useEffect, useState } from 'react';

export const OrderDetails = () => {
  const { orderNumber } = useParams();
  const { data: order, isLoading, isError } = useOrder(orderNumber as string);
  const cancelMutation = useCancelOrder();
  
  const createPaymentMutation = useCreatePayment();
  const verifyPaymentMutation = useVerifyPayment();
  const { user } = useAuthStore();
  const { socket, isConnected } = useSocket();
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  useEffect(() => {
    if (isConnected && order && socket) {
      socket.emit('join:order', order._id);
      
      return () => {
        socket.emit('leave:order', order._id);
      };
    }
  }, [isConnected, order, socket]);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!order) return;
    setIsPaymentProcessing(true);
    
    const res = await loadRazorpay();
    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      setIsPaymentProcessing(false);
      return;
    }

    createPaymentMutation.mutate(order._id, {
      onSuccess: (paymentData) => {
        const options = {
          key: paymentData.keyId,
          amount: paymentData.amount,
          currency: paymentData.currency,
          name: 'Kosmiko Wellness',
          description: `Order ${order.orderNumber}`,
          order_id: paymentData.providerOrderId,
          handler: function (response: any) {
            verifyPaymentMutation.mutate({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }, {
              onSettled: () => setIsPaymentProcessing(false)
            });
          },
          prefill: {
            name: user?.name || order.shippingAddress.fullName,
            email: user?.email,
            contact: order.shippingAddress.phone,
          },
          theme: {
            color: '#c25e00',
          },
          modal: {
            ondismiss: function() {
              setIsPaymentProcessing(false);
            }
          }
        };

        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.open();
      },
      onError: (err: any) => {
        alert(err.response?.data?.message || 'Payment creation failed');
        setIsPaymentProcessing(false);
      }
    });
  };

  if (isLoading) return <div className="py-32 text-center">Loading order...</div>;
  if (isError || !order) return <div className="py-32 text-center text-error">Order not found.</div>;

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel this order?')) {
      cancelMutation.mutate(order.orderNumber);
    }
  };

  return (
    <div className="bg-background min-h-screen py-12">
      <Container>
        <Link
          to="/orders"
          className="inline-flex items-center text-text-muted hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
        </Link>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="w-full lg:w-2/3">
            <h1 className="font-serif text-3xl font-bold text-primary mb-2">Order {order.orderNumber}</h1>
            <p className="text-text-muted mb-8">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
            
            <div className="bg-surface rounded-2xl border border-border p-6 mb-8">
              <h2 className="font-bold text-lg mb-6">Items</h2>
              <ul className="divide-y divide-border">
                {order.items.map((item: any) => (
                  <li key={item._id} className="py-4 flex gap-4 items-center">
                    <div className="w-16 h-16 bg-background rounded border border-border p-1 flex-shrink-0">
                      <img 
                        src={item.image || '/assets/products/product-box.jpg'} 
                        alt={item.name}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      {item.variant && <div className="text-sm text-text-muted mt-1">Size: {item.variant}</div>}
                      <div className="text-sm text-text-muted">Qty: {item.quantity}</div>
                    </div>
                    <div className="font-medium">
                      {formatINR(item.priceSnapshot * item.quantity)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-surface rounded-2xl border border-border p-6">
                <h2 className="font-bold text-lg mb-4">Shipping Address</h2>
                <address className="not-italic text-text-main text-sm space-y-1">
                  <p className="font-medium">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                  <p>{order.shippingAddress.country}</p>
                  <p className="pt-2 text-text-muted">{order.shippingAddress.phone}</p>
                </address>
              </div>
              
              <div className="bg-surface rounded-2xl border border-border p-6">
                <h2 className="font-bold text-lg mb-4">Billing Address</h2>
                <address className="not-italic text-text-main text-sm space-y-1">
                  <p className="font-medium">{order.billingAddress.fullName}</p>
                  <p>{order.billingAddress.addressLine1}</p>
                  {order.billingAddress.addressLine2 && <p>{order.billingAddress.addressLine2}</p>}
                  <p>{order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.postalCode}</p>
                  <p>{order.billingAddress.country}</p>
                </address>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/3 space-y-8">
            <div className="bg-surface rounded-2xl border border-border p-6">
              <h2 className="font-bold text-lg mb-4">Summary</h2>
              <div className="space-y-3 text-sm mb-6 border-b border-border pb-6">
                <div className="flex justify-between">
                  <span className="text-text-muted">Subtotal</span>
                  <span>{formatINR(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Shipping</span>
                  <span>{formatINR(order.shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Tax</span>
                  <span>{formatINR(order.tax)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-error">
                    <span>Discount</span>
                    <span>-{formatINR(order.discount)}</span>
                  </div>
                )}
              </div>
              <div className="flex justify-between items-end mb-6">
                <span className="font-bold text-lg">Total</span>
                <span className="font-serif font-bold text-2xl text-primary">{formatINR(order.total)}</span>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-neutral-50 p-3 rounded-lg border border-border">
                  <span className="text-sm font-medium">Order Status</span>
                  <span className="text-sm font-bold uppercase tracking-wide">{order.orderStatus}</span>
                </div>
                
                <div className="flex justify-between items-center bg-neutral-50 p-3 rounded-lg border border-border">
                  <span className="text-sm font-medium">Payment Method</span>
                  <span className="text-sm font-bold text-emerald-800">
                    {order.paymentMethod === 'COD' ? '💵 Cash on Delivery (COD)' : '💳 Online Payment'}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-neutral-50 p-3 rounded-lg border border-border">
                  <span className="text-sm font-medium">Payment Status</span>
                  <span className={`text-sm font-bold uppercase tracking-wide ${order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-amber-600'}`}>
                    {order.paymentMethod === 'COD' ? 'Pay Upon Delivery' : order.paymentStatus}
                  </span>
                </div>

                {order.paymentMethod !== 'COD' && order.paymentStatus !== 'PAID' && order.orderStatus !== 'CANCELLED' && (
                  <Button 
                    variant="solid" 
                    className="w-full"
                    onClick={handlePayment}
                    disabled={isPaymentProcessing || createPaymentMutation.isPending || verifyPaymentMutation.isPending}
                  >
                    {isPaymentProcessing || createPaymentMutation.isPending ? 'Connecting...' : verifyPaymentMutation.isPending ? 'Verifying...' : 'Pay Now Securely'}
                  </Button>
                )}

                {order.orderStatus === 'PENDING' && (
                  <Button 
                    variant="outline" 
                    className="w-full text-error border-error/20 hover:bg-error/5"
                    onClick={handleCancel}
                    disabled={cancelMutation.isPending}
                  >
                    Cancel Order
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};
