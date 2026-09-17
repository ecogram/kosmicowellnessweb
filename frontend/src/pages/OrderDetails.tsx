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
          name: 'Kosmico Wellness',
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
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-primary mb-2 break-all">
              Order #{order.orderNumber || (order._id ? (order._id.startsWith('ord_') ? order._id : order._id) : (order.shiprocketOrderId || 'Order'))}
            </h1>
            <p className="text-text-muted mb-8">Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
            
            <div className="bg-surface rounded-2xl border border-border p-6 mb-8">
              <h2 className="font-bold text-lg mb-6">Items</h2>
              <ul className="divide-y divide-border">
                {(order.items || []).map((item: any, idx: number) => (
                  <li key={item._id || idx} className="py-4 flex gap-4 items-center">
                    <div className="w-16 h-16 bg-background rounded border border-border p-1 flex-shrink-0">
                      <img 
                        src={item.image || (item.product && item.product.images && item.product.images[0]) || '/assets/products/product-box.jpg'} 
                        alt={item.name || item.title || 'Product'}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{item.name || item.title || 'Sweet Monk (250ml)'}</div>
                      {item.variant && <div className="text-sm text-text-muted mt-1">Size: {item.variant}</div>}
                      <div className="text-sm text-text-muted">Qty: {item.quantity || item.qty || 1}</div>
                    </div>
                    <div className="font-medium">
                      {formatINR((item.priceSnapshot || item.price || 387) * (item.quantity || item.qty || 1))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-surface rounded-2xl border border-border p-6">
              <h2 className="font-bold text-lg mb-4">Shipping Address</h2>
              <address className="not-italic text-text-main text-sm space-y-1">
                <p className="font-bold text-base text-neutral-900">{order.shippingAddress?.fullName || order.deliveryAddress?.fullName || order.userName || user?.name || 'Customer'}</p>
                <p>{order.shippingAddress?.streetAddress || order.shippingAddress?.addressLine1 || order.deliveryAddress?.streetAddress || order.deliveryAddress?.addressLine1 || ''}</p>
                {(order.shippingAddress?.addressLine2 || order.deliveryAddress?.addressLine2) && (
                  <p>{order.shippingAddress?.addressLine2 || order.deliveryAddress?.addressLine2}</p>
                )}
                <p>
                  {[
                    order.shippingAddress?.city || order.deliveryAddress?.city,
                    order.shippingAddress?.state || order.deliveryAddress?.state,
                    order.shippingAddress?.pincode || order.shippingAddress?.postalCode || order.deliveryAddress?.pincode || order.deliveryAddress?.postalCode
                  ].filter(Boolean).join(', ')}
                </p>
                <p>{order.shippingAddress?.country || order.deliveryAddress?.country || 'India'}</p>
                {(order.shippingAddress?.phone || order.shippingAddress?.phoneNumber || order.deliveryAddress?.phoneNumber || order.deliveryAddress?.phone) && (
                  <p className="pt-2 text-text-muted font-medium">
                    📞 {order.shippingAddress?.phone || order.shippingAddress?.phoneNumber || order.deliveryAddress?.phoneNumber || order.deliveryAddress?.phone}
                  </p>
                )}
              </address>
            </div>
          </div>

          <div className="w-full lg:w-1/3 space-y-8">
            <div className="bg-surface rounded-2xl border border-border p-6">
              <h2 className="font-bold text-lg mb-4">Summary</h2>
              {(() => {
                const isCOD = (order.paymentMethod || '').toUpperCase() === 'COD';
                const orderSubtotal = Number(order.subtotal || (order.items || []).reduce((s: number, it: any) => s + (it.priceSnapshot || it.price || 387) * (it.quantity || 1), 0) || 387);
                const shippingFee = Number(order.shipping ?? order.deliveryFee ?? (isCOD ? 77 : 0));
                const taxFee = Number(order.tax ?? order.gstCharge ?? (isCOD ? 13 : 0));
                const discountAmt = Number(order.discount ?? order.discountAmount ?? 0);

                let orderTotal = Number(order.total ?? (order.amount && order.amount > 10000 ? order.amount / 100 : order.amount) ?? 0);
                if (!orderTotal || (isCOD && orderTotal <= orderSubtotal && (shippingFee > 0 || taxFee > 0))) {
                  orderTotal = orderSubtotal - discountAmt + shippingFee + taxFee;
                }

                return (
                  <>
                    <div className="space-y-3 text-sm mb-6 border-b border-border pb-6">
                      <div className="flex justify-between">
                        <span className="text-text-muted">Subtotal</span>
                        <span className="font-medium">{formatINR(orderSubtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">
                          Delivery Fee {!isCOD && <span className="text-emerald-700 text-xs font-semibold">(Free)</span>}
                        </span>
                        <span className={!isCOD ? 'text-emerald-700 font-bold' : 'font-medium'}>
                          {!isCOD ? 'FREE' : formatINR(shippingFee)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">GST</span>
                        <span className="font-medium">{!isCOD ? '₹0' : formatINR(taxFee)}</span>
                      </div>
                      {discountAmt > 0 && (
                        <div className="flex justify-between text-emerald-700 font-semibold">
                          <span>Discount</span>
                          <span>-{formatINR(discountAmt)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-end mb-6">
                      <span className="font-bold text-lg">Total Amount</span>
                      <span className="font-sans font-bold text-2xl text-primary">{formatINR(orderTotal)}</span>
                    </div>
                  </>
                );
              })()}
              
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-neutral-50 p-3 rounded-lg border border-border">
                  <span className="text-sm font-medium">Order Status</span>
                  <span className="text-sm font-bold uppercase tracking-wide">{order.orderStatus || 'CONFIRMED'}</span>
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
                    {order.paymentMethod === 'COD' ? 'Pay Upon Delivery' : order.paymentStatus || 'PAID'}
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
