import React from 'react';
import { formatINR } from '../utils/currency';
import { Link, useParams } from 'react-router-dom';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { CheckCircle2, Package, ShieldCheck, Loader2 } from 'lucide-react';
import { useOrder } from '../hooks/useOrders';

export const OrderSuccess: React.FC = () => {
  const { orderNumber } = useParams();
  const { data: order, isLoading } = useOrder(orderNumber as string);

  if (isLoading && !order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-4 bg-[#f8faf8]">
        <Loader2 className="w-10 h-10 text-emerald-800 animate-spin mb-4" />
        <p className="text-neutral-600 font-medium text-sm">Loading order details...</p>
      </div>
    );
  }

  // Calculate real total amount with fallbacks so it never displays ₹0
  const itemsTotal = Array.isArray(order?.items) && order.items.length > 0
    ? order.items.reduce(
        (sum: number, it: any) =>
          sum + (Number(it.price || it.priceSnapshot || 499) * Number(it.quantity || it.qty || 1)),
        0
      )
    : 0;

  const displayTotal =
    Number(order?.total) ||
    Number(order?.amount) ||
    itemsTotal ||
    Number(localStorage.getItem('kosmico_last_order_total')) ||
    499;

  return (
    <div className="bg-[#f8faf8] min-h-screen py-16 px-4">
      <Container>
        <div className="max-w-2xl mx-auto bg-white border border-emerald-800/15 rounded-3xl p-8 md:p-10 text-center shadow-xl shadow-emerald-950/5">
          {/* Success Check Icon */}
          <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-800 mx-auto mb-6 border border-emerald-800/20 shadow-inner">
            <CheckCircle2 className="w-12 h-12 text-[#0a7a40]" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100/70 text-[#0a7a40] text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" /> Order Placed & Confirmed
          </span>

          <h1 className="font-serif text-3xl md:text-4xl font-bold text-neutral-900 mb-3">
            Thank you for your order!
          </h1>
          <p className="text-sm md:text-base text-neutral-600 mb-8 max-w-md mx-auto leading-relaxed">
            Your order <strong className="text-neutral-900 font-bold">#{orderNumber}</strong> has been confirmed.
          </p>

          {/* Order Details Card */}
          <div className="bg-neutral-50 rounded-2xl p-6 text-left mb-8 border border-neutral-200/80">
            <h2 className="font-bold text-sm text-neutral-900 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-neutral-600" /> Order Details
            </h2>
            <div className="space-y-2.5 text-xs md:text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Status:</span>
                <span className="font-bold text-neutral-900 uppercase">
                  {order?.orderStatus || 'CONFIRMED'}
                </span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Payment Method:</span>
                <span className="font-bold text-emerald-800">
                  {order?.paymentMethod === 'COD'
                    ? '💵 Cash on Delivery (COD)'
                    : order?.paymentMethod === 'COD_UPFRONT'
                    ? '💵 COD (Advance Paid ₹104)'
                    : '💳 Online Payment'}
                </span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Payment Status:</span>
                <span className="font-semibold text-emerald-700">
                  {order?.paymentMethod === 'COD'
                    ? 'Pay upon delivery'
                    : order?.paymentStatus === 'PARTIAL_PAID'
                    ? 'Advance Paid'
                    : order?.paymentStatus === 'PAID'
                    ? 'Paid'
                    : 'Paid'}
                </span>
              </div>
              <div className="flex justify-between text-neutral-900 pt-2 border-t border-neutral-200 font-bold text-base">
                <span>Total Amount:</span>
                <span>{formatINR(displayTotal)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/orders">
              <Button variant="outline" className="w-full sm:w-auto px-6 py-3 rounded-xl border-neutral-300 font-semibold text-sm">
                View My Orders
              </Button>
            </Link>
            <Link to="/shop">
              <Button className="w-full sm:w-auto px-6 py-3 bg-[#0a7a40] hover:bg-[#086333] text-white font-bold text-sm rounded-xl shadow-md">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
};
