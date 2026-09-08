import { formatINR } from '../utils/currency';
import { Link, useParams } from 'react-router-dom';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { CheckCircle2 } from 'lucide-react';
import { useOrder } from '../hooks/useOrders';

export const OrderSuccess = () => {
  const { orderNumber } = useParams();
  const { data: order, isLoading } = useOrder(orderNumber as string);

  if (isLoading) {
    return <div className="py-32 text-center">Loading order details...</div>;
  }

  return (
    <div className="bg-background min-h-screen py-20">
      <Container>
        <div className="max-w-2xl mx-auto bg-surface border border-border rounded-2xl p-10 text-center shadow-sm">
          <div className="flex justify-center mb-6">
            <CheckCircle2 className="w-20 h-20 text-green-500" />
          </div>
          <h1 className="font-serif text-4xl font-bold text-primary mb-4">Thank you for your order!</h1>
          <p className="text-lg text-text-muted mb-8">
            Your order <strong className="text-text-main">{orderNumber}</strong> has been confirmed.
          </p>
          
          {order && (
            <div className="bg-neutral-50 rounded-xl p-6 text-left mb-8 border border-border">
              <h2 className="font-bold text-lg mb-4">Order Details</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Status:</span>
                  <span className="font-medium">{order.orderStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Payment Method:</span>
                  <span className="font-bold text-emerald-800">
                    {order.paymentMethod === 'COD' ? '💵 Cash on Delivery (COD)' : '💳 Online Payment'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Payment Status:</span>
                  <span className="font-medium text-amber-600">
                    {order.paymentMethod === 'COD' ? 'Pay upon delivery' : order.paymentStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Total:</span>
                  <span className="font-medium">{formatINR(order.total)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/orders">
              <Button variant="outline" className="w-full sm:w-auto">View My Orders</Button>
            </Link>
            <Link to="/shop">
              <Button className="w-full sm:w-auto">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
};
