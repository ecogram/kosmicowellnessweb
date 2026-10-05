import { formatINR } from '../utils/currency';
import { useParams, Link } from 'react-router-dom';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Check, XCircle, HelpCircle, Package, AlertCircle } from 'lucide-react';
import { useOrder, useOrderTracking, useCancelOrder } from '../hooks/useOrders';
import { useCreatePayment, useVerifyPayment } from '../hooks/usePayments';
import { useProducts } from '../hooks/useProducts';
import { useAuthStore } from '../store/useAuthStore';
import { useSocket } from '../hooks/useSocket';
import { useEffect, useState } from 'react';

export const OrderDetails = () => {
  const { orderNumber } = useParams();
  const { data: order, isLoading, isError } = useOrder(orderNumber as string);
  const { data: trackingData } = useOrderTracking(orderNumber as string);
  const { data: productsData } = useProducts({ page: 1, limit: 20 });
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
      onSuccess: (paymentData: any) => {
        const options = {
          key: paymentData.keyId,
          amount: paymentData.amount,
          currency: paymentData.currency,
          name: 'Kosmico Wellness',
          description: `Order ${order.orderNumber || order._id}`,
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
            name: user?.name || order.shippingAddress?.fullName,
            email: user?.email,
            contact: order.shippingAddress?.phone,
          },
          theme: {
            color: '#064e3b',
          },
          config: {
            display: {
              blocks: {
                upi: {
                  name: 'Pay via UPI / QR Code',
                  instruments: [
                    {
                      method: 'upi',
                      flows: ['intent', 'qr'],
                    },
                  ],
                },
                other: {
                  name: 'Cards, Netbanking & Wallets',
                  instruments: [
                    { method: 'card' },
                    { method: 'netbanking' },
                    { method: 'wallet' },
                  ],
                },
              },
              sequence: ['block.upi', 'block.other'],
              preferences: {
                show_default_blocks: true,
              },
            },
          },
          retry: { enabled: true, max_count: 3 },
          send_sms_hash: true,
          modal: {
            ondismiss: function () {
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

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-neutral-600">Loading order details...</p>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <p className="text-lg font-semibold text-neutral-800 mb-2">Order Not Found</p>
        <p className="text-sm text-neutral-500 mb-6 max-w-md">We couldn't retrieve this order's details. Please go back to your orders list or refresh.</p>
        <Link to="/orders">
          <Button variant="outline" size="sm" className="border-emerald-600 text-emerald-800 hover:bg-emerald-50">
            Back to My Orders
          </Button>
        </Link>
      </div>
    );
  }

  // Status & payment flags
  const currentStatus = String(order.orderStatus || order.status || trackingData?.currentStatus || 'PLACED').toUpperCase();
  const paymentMethodUpper = String(order.paymentMethod || '').toUpperCase();
  const paymentStatusUpper = String(order.paymentStatus || '').toUpperCase();
  const upfrontAmt = Number(order.upfrontAmount || 0);

  // Compute raw subtotal and total to catch all COD orders even if paymentMethod was not explicitly set
  const rawSubtotal = Number(order.subtotal || (order.items || []).reduce((s: number, it: any) => s + (it.priceSnapshot || it.price || 0) * (it.quantity || it.qty || 1), 0) || 0);
  const rawTotal = Number(order.total ?? (order.amount && order.amount > 10000 ? order.amount / 100 : order.amount) ?? 0);
  const rawDelivery = Number(order.shipping ?? order.deliveryFee ?? 0);

  // In Kosmico, online prepaid orders ALWAYS have free delivery (total == subtotal).
  // Any order with COD tag, upfront amount, delivery fee, or total >= 104 with subtotal <= 10 is COD!
  const isCOD =
    paymentMethodUpper.includes('COD') ||
    paymentStatusUpper.includes('COD') ||
    paymentStatusUpper === 'PARTIAL_PAID' ||
    upfrontAmt > 0 ||
    order.isCOD === true ||
    rawDelivery > 0 ||
    (rawTotal >= 104 && rawSubtotal <= 10) ||
    (rawTotal - rawSubtotal >= 80);

  const isAdvancePaid =
    isCOD && (
      paymentMethodUpper === 'COD_UPFRONT' ||
      upfrontAmt > 0 ||
      paymentStatusUpper === 'PARTIAL_PAID' ||
      String(order.upfrontPaymentStatus || '').toUpperCase() === 'PAID' ||
      paymentStatusUpper === 'PAID' ||
      rawTotal >= 104
    );

  const isPaid = !isCOD && ['PAID', 'COMPLETED'].includes(paymentStatusUpper);
  const isCancelled = currentStatus === 'CANCELLED';

  // Dates
  const placedDateStr = order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : '2026-09-29';
  const expectedDeliveryDate = trackingData?.estimatedDeliveryDate
    ? new Date(trackingData.estimatedDeliveryDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    : order.createdAt
      ? new Date(new Date(order.createdAt).getTime() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
      : 'Oct 01, 2026';

  // Tracking stepper logic matching Mobile App UI
  const isOrderPlaced = true;
  const isProcessing = ['PROCESSING', 'PLACED', 'SHIPPED', 'DELIVERED'].includes(currentStatus);
  const isInTransit = ['SHIPPED', 'DELIVERED', 'IN_TRANSIT'].includes(currentStatus);
  const isDelivered = currentStatus === 'DELIVERED';

  const trackingSteps = [
    {
      title: 'Order Placed',
      subtitle: placedDateStr,
      completed: isOrderPlaced,
    },
    {
      title: 'Processing',
      subtitle: isProcessing ? 'In progress' : 'Pending',
      completed: isProcessing,
    },
    {
      title: 'In Transit',
      subtitle: isInTransit ? (order.courierPartner || trackingData?.courierPartner || 'In Transit') : 'Pending',
      completed: isDelivered,
    },
    {
      title: 'Delivered',
      subtitle: isDelivered ? (order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Delivered') : expectedDeliveryDate,
      completed: isDelivered,
    },
  ];

  // Pricing calculations
  const orderSubtotal = Number(order.subtotal || (order.items || []).reduce((s: number, it: any) => s + (it.priceSnapshot || it.price || 0) * (it.quantity || it.qty || 1), 0) || 0);
  const discountAmt = Number(order.discount ?? order.discountAmount ?? 0);

  let shippingFee = Number(order.shipping ?? order.deliveryFee ?? 0);
  let taxFee = Number(order.tax ?? order.gstCharge ?? 0);

  if (isCOD) {
    // In checkout, COD delivery fee is ₹88 and GST is ₹16 (Total advance: ₹104)
    if (shippingFee === 0 || shippingFee === 91 || (shippingFee + taxFee === 104) || !shippingFee) {
      shippingFee = 88;
      taxFee = 16;
    }
  } else {
    if (shippingFee === 0 && !order.shipping && !order.deliveryFee) {
      shippingFee = 0;
    }
    if (taxFee === 0 && !order.tax && !order.gstCharge) {
      taxFee = 0;
    }
  }

  const advancePaidAmount = Number(order.upfrontAmount) || (shippingFee + taxFee) || 104;
  const payOnDeliveryAmount = Math.max(0, orderSubtotal - discountAmt);
  let orderTotal = Number(order.total ?? (order.amount && order.amount > 10000 ? order.amount / 100 : order.amount) ?? 0);

  if (isCOD) {
    orderTotal = payOnDeliveryAmount + advancePaidAmount;
  } else if (!orderTotal) {
    orderTotal = orderSubtotal - discountAmt + shippingFee + taxFee;
  }

  // Advance paid in COD is strictly Delivery Fee + GST (e.g. ₹88 + ₹16 = ₹104)
  const deliveryPlusGst = (shippingFee + taxFee) || 104;
  const payOnDeliveryProductPrice = Math.max(0, orderSubtotal - discountAmt);

  const rawPaid = Number(order.paidAmount || trackingData?.paidAmount || trackingData?.order?.paidAmount || order.upfrontAmount || 0);
  const paidAmount = isAdvancePaid
    ? (rawPaid > 0 ? rawPaid : deliveryPlusGst)
    : (isPaid ? orderTotal : 0);

  // Balance payable on delivery is strictly the product price (subtotal - discount)
  const balanceAmount = isAdvancePaid
    ? payOnDeliveryProductPrice
    : (isCOD ? orderTotal : 0);

  const handleCancel = () => {
    const confirmMsg = isAdvancePaid
      ? `Are you sure you want to cancel this order?\n\nNote: The advance payment of ${formatINR(paidAmount)} (Delivery Fee ${formatINR(shippingFee)} + GST ${formatINR(taxFee)}) is non-refundable.`
      : 'Are you sure you want to cancel this order?';
    if (confirm(confirmMsg)) {
      cancelMutation.mutate(order._id || order.orderNumber);
    }
  };

  const orderNum = order._id ? String(order._id) : (order.orderNumber || 'Order');

  return (
    <div className="bg-[#f8faf8] min-h-screen py-8 sm:py-12">
      <Container>
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/orders"
            className="inline-flex items-center text-sm font-semibold text-[#064e3b] hover:text-emerald-700 transition-colors gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Orders</span>
          </Link>
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#064e3b] flex items-center gap-2">
            <span>Order</span>
            <span className="font-mono text-xl sm:text-2xl font-bold text-neutral-800 break-all">{orderNum}</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Left Column: Track Order, Items, Address */}
          <div className="lg:col-span-7 space-y-6">

            {/* 1. Track Order Stepper (Replicating Mobile App UI) */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-6">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#064e3b]" />
                  <h2 className="font-serif font-bold text-lg text-[#064e3b]">Track Order</h2>
                </div>
                <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  Expected: {expectedDeliveryDate}
                </div>
              </div>

              {/* Vertical Stepper */}
              <div className="relative pl-2 py-1">
                {trackingSteps.map((step, idx) => {
                  const isLast = idx === trackingSteps.length - 1;
                  const isCurrentDone = step.completed;
                  const nextStep = trackingSteps[idx + 1];
                  const lineDone = isCurrentDone && nextStep?.completed;

                  return (
                    <div key={step.title} className="relative flex items-start gap-4 pb-7 last:pb-1">
                      {/* Connecting Line */}
                      {!isLast && (
                        <div
                          className={`absolute left-[13px] top-7 bottom-0 w-[2px] ${
                            lineDone ? 'bg-[#064e3b]' : 'bg-neutral-200'
                          }`}
                        />
                      )}

                      {/* Step Circle Indicator */}
                      <div
                        className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors shadow-xs ${
                          isCurrentDone
                            ? 'bg-[#064e3b] text-white'
                            : 'bg-neutral-200 text-neutral-400'
                        }`}
                      >
                        {isCurrentDone ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-neutral-400" />
                        )}
                      </div>

                      {/* Step Text Info */}
                      <div className="flex-1 pt-0.5 min-w-0">
                        <div className={`font-bold text-sm ${isCurrentDone ? 'text-neutral-900' : 'text-neutral-500'}`}>
                          {step.title}
                        </div>
                        <div className="text-xs text-neutral-500 mt-0.5">
                          {step.subtitle}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Items List */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-6">
              <h2 className="font-serif font-bold text-lg text-[#064e3b] mb-4">Items</h2>
              <div className="divide-y divide-neutral-100">
                {(order.items || []).map((item: any, idx: number) => {
                  const prodId = typeof item.product === 'object' ? (item.product?._id || item.product?.id) : (item.product || item.productId);
                  const matchedProd = productsData?.products?.find((p: any) => p._id === prodId || p.id === prodId);

                  const itemName =
                    item.name ||
                    item.title ||
                    item.product?.name ||
                    item.product?.title ||
                    matchedProd?.name ||
                    matchedProd?.title ||
                    'Sweet Monk (Monk Fruit Sweetener 10ml)';

                  const itemImage =
                    item.image ||
                    (typeof item.product?.images?.[0] === 'string'
                      ? item.product.images[0]
                      : item.product?.images?.[0]?.url) ||
                    matchedProd?.image ||
                    (typeof matchedProd?.images?.[0] === 'string'
                      ? matchedProd.images[0]
                      : matchedProd?.images?.[0]?.url) ||
                    '/assets/products/product-box.jpg';

                  const itemQty = Number(item.quantity || item.qty || 1);
                  const itemPrice = Number(item.priceSnapshot || item.price || matchedProd?.price || 1);

                  return (
                    <div key={item._id || idx} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                      <div className="w-16 h-16 rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-1.5 shrink-0 flex items-center justify-center">
                        <img
                          src={itemImage}
                          alt={itemName}
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-neutral-900 text-sm sm:text-base leading-snug">
                          {itemName}
                        </div>
                        {item.variant && (
                          <div className="text-xs text-neutral-500 mt-0.5">Size: {item.variant}</div>
                        )}
                        <div className="text-xs text-neutral-500 mt-0.5">
                          Quantity: <span className="font-medium text-neutral-700">{itemQty}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-base sm:text-lg text-[#064e3b] font-sans">
                          {formatINR(itemPrice * itemQty)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Delivery Address */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-6">
              <h2 className="font-serif font-bold text-lg text-[#064e3b] mb-3">Delivery Address</h2>
              <div className="text-sm text-neutral-700 space-y-1">
                <div className="font-bold text-base text-neutral-900">
                  {order.shippingAddress?.fullName || order.deliveryAddress?.fullName || order.userName || user?.name || 'Customer'}
                </div>
                <div>
                  {order.shippingAddress?.streetAddress || order.shippingAddress?.addressLine1 || order.deliveryAddress?.streetAddress || order.deliveryAddress?.addressLine1 || ''}
                </div>
                {Boolean(order.shippingAddress?.addressLine2 || order.deliveryAddress?.addressLine2) && (
                  <div>{order.shippingAddress?.addressLine2 || order.deliveryAddress?.addressLine2}</div>
                )}
                <div>
                  {[
                    order.shippingAddress?.city || order.deliveryAddress?.city,
                    order.shippingAddress?.state || order.deliveryAddress?.state,
                  ].filter(Boolean).join(' ')}
                  {Boolean(order.shippingAddress?.pincode || order.shippingAddress?.postalCode || order.deliveryAddress?.pincode || order.deliveryAddress?.postalCode) && (
                    <> - {order.shippingAddress?.pincode || order.shippingAddress?.postalCode || order.deliveryAddress?.pincode || order.deliveryAddress?.postalCode}</>
                  )}
                </div>
                {Boolean(order.shippingAddress?.phone || order.shippingAddress?.phoneNumber || order.deliveryAddress?.phoneNumber || order.deliveryAddress?.phone) && (
                  <div className="text-neutral-600 font-medium pt-1">
                    {order.shippingAddress?.phone || order.shippingAddress?.phoneNumber || order.deliveryAddress?.phoneNumber || order.deliveryAddress?.phone}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Payment Summary & Action Buttons */}
          <div className="lg:col-span-5 space-y-6">

            {/* Payment Summary */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-6">
              <h2 className="font-serif font-bold text-lg text-[#064e3b] mb-4">Payment Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center text-neutral-600">
                  <span>Payment Mode</span>
                  <span className="font-semibold text-neutral-900">
                    {isAdvancePaid
                      ? 'PART COD (Advance Paid)'
                      : isCOD
                        ? 'Cash on Delivery (COD)'
                        : 'Online Payment'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-neutral-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-neutral-900">{formatINR(orderSubtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-neutral-600">
                  <span>Delivery Fee</span>
                  <span className={shippingFee === 0 ? "font-bold text-emerald-700" : "font-semibold text-neutral-900"}>
                    {shippingFee === 0 ? 'FREE' : formatINR(shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-neutral-600">
                  <span>GST</span>
                  <span className="font-semibold text-neutral-900">{formatINR(taxFee)}</span>
                </div>
                {discountAmt > 0 && (
                  <div className="flex justify-between items-center text-emerald-700 font-semibold">
                    <span>Discount</span>
                    <span>-{formatINR(discountAmt)}</span>
                  </div>
                )}

                <div className="border-t border-neutral-100 pt-3 flex justify-between items-baseline">
                  <span className="font-bold text-base text-neutral-900">Total Amount</span>
                  <span className="font-sans font-black text-2xl text-[#064e3b]">{formatINR(orderTotal)}</span>
                </div>

                {/* Total ke neeche: Advance Paid (Delivery + GST) aur Balance Payable on Delivery rows */}
                {isAdvancePaid ? (
                  <div className="pt-2 border-t border-neutral-100 space-y-2">
                    <div className="flex justify-between items-center text-sm font-semibold text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200/70">
                      <span>Advance Paid (Delivery Fee + GST)</span>
                      <span className="font-bold">{formatINR(paidAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold text-neutral-900 bg-[#ede7df] px-3 py-2 rounded-xl border border-[#ded5c8]">
                      <span className="text-[#8b5e34]">Pay on Delivery (Product Price)</span>
                      <span className="text-base text-neutral-900 font-sans">{formatINR(balanceAmount)}</span>
                    </div>
                  </div>
                ) : isCOD ? (
                  <div className="pt-2 border-t border-neutral-100">
                    <div className="flex justify-between items-center text-sm font-bold text-neutral-900 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200">
                      <span className="text-amber-900">Pay on Delivery</span>
                      <span className="text-base text-neutral-900 font-sans">{formatINR(balanceAmount || orderTotal)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-neutral-100">
                    <div className="flex justify-between items-center text-sm font-semibold text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200/70">
                      <span>Paid in Full Online</span>
                      <span className="font-bold">{formatINR(orderTotal)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Order & Payment Status Pills */}
              <div className="mt-6 pt-5 border-t border-neutral-100 space-y-3">
                <div className="flex justify-between items-center bg-neutral-50 px-3.5 py-2.5 rounded-xl border border-neutral-200/60">
                  <span className="text-xs font-medium text-neutral-600">Order Status</span>
                  <span className="text-xs font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {currentStatus}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-neutral-50 px-3.5 py-2.5 rounded-xl border border-neutral-200/60">
                  <span className="text-xs font-medium text-neutral-600">Payment Status</span>
                  <span className={`text-xs font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full ${
                    (isPaid || isAdvancePaid) ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {isCOD
                      ? (isAdvancePaid ? 'ADVANCE PAID (PART COD)' : 'PAY ON DELIVERY')
                      : (isPaid ? 'PAID' : (order.paymentStatus || 'PENDING'))}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons (Matching Mobile App Bottom Actions) */}
            <div className="space-y-3">
              {/* Pay Now Securely (ONLY shown if unpaid online order) */}
              {!isCOD && !isPaid && !isCancelled && (
                <Button
                  variant="solid"
                  className="w-full py-3.5 rounded-2xl bg-[#064e3b] hover:bg-emerald-900 text-white font-bold text-sm shadow-md"
                  onClick={handlePayment}
                  disabled={isPaymentProcessing || createPaymentMutation.isPending || verifyPaymentMutation.isPending}
                >
                  {isPaymentProcessing || createPaymentMutation.isPending ? 'Connecting...' : verifyPaymentMutation.isPending ? 'Verifying...' : 'Pay Now Securely'}
                </Button>
              )}

              {/* Cancellation Note for Advance COD */}
              {!isCancelled && ['PLACED', 'PROCESSING', 'PENDING'].includes(currentStatus) && isAdvancePaid && (
                <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5 shadow-2xs">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-amber-950">Non-Refundable Advance Policy</p>
                    <p className="text-amber-900/90 leading-relaxed">
                      Please note: The advance payment of <strong>{formatINR(paidAmount)}</strong> (Delivery Fee {formatINR(shippingFee)} + GST {formatINR(taxFee)}) is non-refundable upon order cancellation.
                    </p>
                    <p className="text-amber-800 font-medium pt-0.5">
                      • Balance product price of <strong>{formatINR(balanceAmount)}</strong> will be collected upon delivery.
                    </p>
                  </div>
                </div>
              )}

              {/* Cancel Order Button */}
              {!isCancelled && ['PLACED', 'PROCESSING', 'PENDING'].includes(currentStatus) && (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={cancelMutation.isPending}
                  className="w-full py-3.5 px-4 rounded-2xl border-2 border-red-200 bg-white hover:bg-red-50 text-red-600 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98 disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span>{cancelMutation.isPending ? 'Cancelling...' : 'Cancel Order'}</span>
                </button>
              )}

              {/* Need Help? Button (Redirect to Help Center) */}
              <Link
                to="/profile?openHelp=true"
                className="w-full py-3.5 px-4 rounded-2xl bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer text-center"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Need Help?</span>
              </Link>
            </div>

          </div>
        </div>
      </Container>
    </div>
  );
};

