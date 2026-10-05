import React from 'react';
import { formatINR } from '../utils/currency';
import { Link } from 'react-router-dom';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { useOrders } from '../hooks/useOrders';
import { Package, Calendar, ChevronRight, ChevronLeft } from 'lucide-react';

export const Orders: React.FC = () => {
  const { data, isLoading } = useOrders({ page: 1, limit: 200 });
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 10;
  const tableRef = React.useRef<HTMLDivElement>(null);

  const rawOrders = data?.orders || [];
  const allOrders = React.useMemo(() => {
    return [...rawOrders].sort((a: any, b: any) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (!isNaN(timeA) && !isNaN(timeB) && timeA !== timeB) {
        return timeB - timeA; // Latest date on top
      }
      return (b.orderNumber || b._id || '').localeCompare(a.orderNumber || a._id || '');
    });
  }, [rawOrders]);

  const totalOrders = allOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalOrders / pageSize));

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedOrders = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return allOrders.slice(startIndex, startIndex + pageSize);
  }, [allOrders, currentPage, pageSize]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-neutral-600">Loading your orders...</p>
      </div>
    );
  }

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
            <Button variant="outline" size="sm" className="hidden sm:inline-flex border-emerald-600 text-emerald-700 hover:bg-emerald-50">
              Order Now
            </Button>
          </Link>
        </div>

        {allOrders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-emerald-100 p-8 sm:p-12 text-center shadow-sm max-w-lg mx-auto my-6">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5 text-emerald-600 shadow-inner">
              <Package className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-serif text-bold text-[#064e3b] mb-2 font-bold">
              No orders placed yet
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mb-8 max-w-sm mx-auto leading-relaxed">
              Explore our 100% natural Zero-Calorie Sweet Monk sweeteners and premium wellness products.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link to="/shop" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-xl shadow-md transition-all hover:scale-105">
                  Order Now
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div ref={tableRef} className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden scroll-mt-24">
            <div className="hidden md:grid grid-cols-12 gap-4 p-5 bg-neutral-50/80 border-b border-neutral-200 text-xs font-bold text-neutral-600 uppercase tracking-wider">
              <div className="col-span-3">Order Identifier</div>
              <div className="col-span-3">Date Placed</div>
              <div className="col-span-2">Delivery Status</div>
              <div className="col-span-2 text-right">Amount</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            <ul className="divide-y divide-neutral-100">
              {paginatedOrders.map((order: any) => {
                const orderNum = order._id ? String(order._id) : (order.orderNumber || 'Order');
                const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent';
                const orderStatus = String(order.orderStatus || order.status || 'CONFIRMED').toUpperCase();
                const paymentMethodUpper = String(order.paymentMethod || '').toUpperCase();
                const paymentStatusUpper = String(order.paymentStatus || '').toUpperCase();
                const upfrontAmt = Number(order.upfrontAmount || 0);
                const orderSubtotal = Number(order.subtotal || (order.items || []).reduce((s: number, it: any) => s + (it.priceSnapshot || it.price || 0) * (it.quantity || it.qty || 1), 0) || 0);
                const discountAmt = Number(order.discount ?? order.discountAmount ?? 0);
                let orderTotal = Number(order.total ?? (order.amount && order.amount > 10000 ? order.amount / 100 : order.amount) ?? 0);
                let shippingFee = Number(order.shipping ?? order.deliveryFee ?? 0);
                let taxFee = Number(order.tax ?? order.gstCharge ?? 0);

                const isCOD =
                  paymentMethodUpper.includes('COD') ||
                  paymentStatusUpper.includes('COD') ||
                  paymentStatusUpper === 'PARTIAL_PAID' ||
                  upfrontAmt > 0 ||
                  order.isCOD === true ||
                  shippingFee > 0 ||
                  (orderTotal >= 104 && orderSubtotal <= 10) ||
                  (orderTotal - orderSubtotal >= 80);

                const isAdvancePaid =
                  isCOD && (
                    paymentMethodUpper === 'COD_UPFRONT' ||
                    upfrontAmt > 0 ||
                    paymentStatusUpper === 'PARTIAL_PAID' ||
                    String(order.upfrontPaymentStatus || '').toUpperCase() === 'PAID' ||
                    paymentStatusUpper === 'PAID' ||
                    orderTotal >= 104
                  );

                if (isCOD) {
                  if (shippingFee === 0 || shippingFee === 91 || (shippingFee + taxFee === 104) || !shippingFee) {
                    shippingFee = 88;
                    taxFee = 16;
                  }
                }
                const advancePaidAmount = Number(order.upfrontAmount) || (shippingFee + taxFee) || 104;
                const payOnDeliveryAmount = Math.max(0, orderSubtotal - discountAmt);
                if (isCOD) {
                  orderTotal = payOnDeliveryAmount + advancePaidAmount;
                } else if (!orderTotal) {
                  orderTotal = orderSubtotal - discountAmt + shippingFee + taxFee;
                }
                const recipientName = order.shippingAddress?.fullName || order.userName || 'Customer';
                const recipientCity = order.shippingAddress?.city || order.shippingAddress?.state || '';

                return (
                  <li key={order._id || orderNum} className="p-5 sm:p-6 flex flex-col md:grid md:grid-cols-12 gap-4 items-center hover:bg-emerald-50/30 transition-colors">
                    <div className="col-span-3 w-full">
                      <div className="font-bold text-neutral-900 flex items-center gap-2 mb-1">
                        <Package className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-mono text-xs sm:text-sm font-bold text-[#064e3b] truncate" title={orderNum}>{orderNum}</span>
                      </div>
                      <div className="text-[11px] text-neutral-500 truncate">
                        Deliver to: <span className="font-medium text-neutral-700">{recipientName}</span>{recipientCity ? ` (${recipientCity})` : ''}
                      </div>
                    </div>

                    <div className="col-span-3 w-full text-xs text-neutral-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span>{orderDate}</span>
                    </div>

                    <div className="col-span-2 w-full">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${orderStatus === 'DELIVERED'
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

                    <div className="col-span-2 w-full md:text-right">
                      <span className="md:hidden text-neutral-400 text-xs font-normal mr-2">Total:</span>
                      <div className="font-extrabold text-sm text-[#064e3b]">{formatINR(orderTotal)}</div>
                      <div className="text-[10px] font-medium text-neutral-500">
                        {isCOD ? (isAdvancePaid ? '💵 COD (Advance Paid)' : '💵 COD') : '💳 Online / Prepaid'}
                      </div>
                    </div>

                    <div className="col-span-2 w-full md:text-right">
                      <Link to={`/orders/${order._id || order.orderNumber}`}>
                        <Button size="sm" className="w-full md:w-auto text-xs font-bold rounded-xl bg-[#064e3b] hover:bg-emerald-800 text-white flex items-center justify-center gap-1.5 shadow-xs">
                          <span>Track Order</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Pagination Bar (10 orders per page with numbering & navigation) */}
            {totalOrders > 0 && (
              <div className="p-4 sm:p-5 bg-neutral-50/80 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-neutral-500 font-medium">
                  Showing <span className="font-bold text-neutral-800">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                  <span className="font-bold text-neutral-800">{Math.min(currentPage * pageSize, totalOrders)}</span> of{' '}
                  <span className="font-bold text-neutral-800">{totalOrders}</span> orders
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Prev Button (Left) */}
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage <= 1}
                    className="px-3 py-1.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-white hover:border-[#064e3b] hover:text-[#064e3b] transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 cursor-pointer bg-white shadow-2xs"
                    aria-label="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Prev</span>
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    const isActive = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`min-w-8 h-8 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                          isActive
                            ? 'bg-[#064e3b] text-white shadow-xs scale-105'
                            : 'bg-white border border-neutral-200 text-neutral-700 hover:border-[#064e3b] hover:text-[#064e3b]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {/* Next Button (Right) */}
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage >= totalPages}
                    className="px-3 py-1.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-white hover:border-[#064e3b] hover:text-[#064e3b] transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 cursor-pointer bg-white shadow-2xs"
                    aria-label="Next Page"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Container>
    </div>
  );
};
