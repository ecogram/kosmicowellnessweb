import React from 'react';
import { formatINR } from '../utils/currency';
import { Link } from 'react-router-dom';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { useOrders } from '../hooks/useOrders';
import { Package, Calendar, ChevronRight } from 'lucide-react';

export const Orders: React.FC = () => {
  const { data, isLoading, isError } = useOrders({ page: 1, limit: 20 });

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-neutral-600">Loading your orders...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <p className="text-sm font-medium text-red-600 mb-4">Failed to load orders.</p>
        <Button onClick={() => window.location.reload()} variant="outline" size="sm">
          Retry
        </Button>
      </div>
    );
  }

  const orders = data?.orders || [];

  return (
    <div className="bg-[#f8faf8] min-h-[85vh] py-10">
      <Container>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#064e3b]">
              My Orders
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Track and manage your Kosmico Wellness shipments
            </p>
          </div>
          <Link to="/shop">
            <Button variant="outline" size="sm" className="hidden sm:inline-flex">
              Continue Shopping
            </Button>
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-emerald-100 p-12 text-center shadow-sm max-w-lg mx-auto">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600">
              <Package className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-serif font-bold text-[#064e3b] mb-2">
              No orders placed yet
            </h2>
            <p className="text-xs text-neutral-500 mb-6 max-w-sm mx-auto">
              Explore our 100% natural Zero-Calorie monk fruit sweeteners and wellness products.
            </p>
            <Link to="/shop">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 p-5 bg-neutral-50/80 border-b border-neutral-200 text-xs font-bold text-neutral-600 uppercase tracking-wider">
              <div className="col-span-3">Order Identifier</div>
              <div className="col-span-3">Date Placed</div>
              <div className="col-span-2">Delivery Status</div>
              <div className="col-span-2 text-right">Amount</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            <ul className="divide-y divide-neutral-100">
              {orders.map((order: any) => {
                const orderNum = order.orderNumber || (order._id ? 'KW-' + order._id.toString().slice(-8).toUpperCase() : 'KW-ORDER');
                const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent';
                const orderTotal = Number(order.total ?? order.amount ?? 0);
                const orderStatus = order.orderStatus || order.status || 'PROCESSING';

                return (
                  <li key={order._id || orderNum} className="p-5 sm:p-6 flex flex-col md:grid md:grid-cols-12 gap-4 items-center hover:bg-emerald-50/30 transition-colors">
                    <div className="col-span-3 w-full font-bold text-neutral-900 flex items-center gap-2">
                      <Package className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-mono text-xs sm:text-sm">{orderNum}</span>
                    </div>

                    <div className="col-span-3 w-full text-xs text-neutral-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{orderDate}</span>
                    </div>

                    <div className="col-span-2 w-full">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${
                          orderStatus === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : orderStatus === 'CANCELLED'
                            ? 'bg-red-100 text-red-800'
                            : orderStatus === 'SHIPPED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {orderStatus}
                      </span>
                    </div>

                    <div className="col-span-2 w-full md:text-right font-extrabold text-sm text-[#064e3b]">
                      <span className="md:hidden text-neutral-400 text-xs font-normal mr-2">Total:</span>
                      {formatINR(orderTotal)}
                    </div>

                    <div className="col-span-2 w-full md:text-right">
                      <Link to={`/orders/${order.orderNumber || order._id}`}>
                        <Button variant="outline" size="sm" className="w-full md:w-auto text-xs font-bold rounded-xl border-emerald-300 hover:bg-emerald-50 text-emerald-800 flex items-center justify-center gap-1">
                          <span>View Details</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </Container>
    </div>
  );
};
