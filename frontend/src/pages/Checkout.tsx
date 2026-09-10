import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { useCart } from '../hooks/useCart';
import { useCreateOrder } from '../hooks/useOrders';
import { useCreatePayment, useVerifyPayment } from '../hooks/usePayments';
import { useAuthStore } from '../store/useAuthStore';
import { formatINR } from '../utils/currency';
import { ShoppingBag } from 'lucide-react';

const addressSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  addressLine1: z.string().min(5, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(5, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
});

type AddressFormValues = z.infer<typeof addressSchema>;

export const Checkout = () => {
  const navigate = useNavigate();
  const { data: cart, isLoading: isCartLoading } = useCart();
  const createOrderMutation = useCreateOrder();
  
  const createPaymentMutation = useCreatePayment();
  const verifyPaymentMutation = useVerifyPayment();
  const { user } = useAuthStore();
  
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'COD'>('ONLINE');
  const [error, setError] = useState<string | null>(null);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      country: 'IN'
    }
  });

  const watchPhone = useWatch({ control, name: 'phone' });
  const watchPostalCode = useWatch({ control, name: 'postalCode' });
  const watchCountry = useWatch({ control, name: 'country' });

  // Auto-detect country from phone number
  useEffect(() => {
    if (watchPhone && watchPhone.startsWith('+')) {
      try {
        const phoneNumber = parsePhoneNumberFromString(watchPhone);
        if (phoneNumber && phoneNumber.country) {
          const supportedCountries = ['US', 'CA', 'IN', 'GB', 'AU'];
          if (supportedCountries.includes(phoneNumber.country)) {
            const currentCountry = getValues('country');
            if (currentCountry !== phoneNumber.country) {
              setValue('country', phoneNumber.country, { shouldValidate: true });
            }
          }
        }
      } catch (err) {
        // Silent catch for invalid typing
      }
    }
  }, [watchPhone, setValue, getValues]);

  // Auto-fill City and State from Postal Code
  useEffect(() => {
    if (!watchPostalCode || watchPostalCode.length < 3 || !watchCountry) return;

    const timeout = setTimeout(async () => {
      try {
        const countryCode = watchCountry.toLowerCase();
        let cityName = '';
        let stateName = '';

        if (countryCode === 'in') {
          // Use reliable Indian postal code API
          const res = await axios.get(`https://api.postalpincode.in/pincode/${watchPostalCode}`);
          if (res.data && res.data[0] && res.data[0].Status === 'Success') {
            const place = res.data[0].PostOffice[0];
            cityName = place.Block || place.District || place.Name;
            stateName = place.State;
          }
        } else {
          // Zippopotam for other supported countries (us, ca, gb, au)
          const res = await axios.get(`https://api.zippopotam.us/${countryCode}/${watchPostalCode}`);
          if (res.data && res.data.places && res.data.places.length > 0) {
            const place = res.data.places[0];
            cityName = place['place name'];
            stateName = place['state'];
          }
        }
        
        if (cityName && stateName) {
          const currentCity = getValues('city');
          const currentState = getValues('state');
          
          if (!currentCity) {
            setValue('city', cityName, { shouldValidate: true });
          }
          if (!currentState) {
            setValue('state', stateName, { shouldValidate: true });
          }
        }
      } catch (err) {
        // Silent catch: postal code might not be found or invalid
      }
    }, 800); // 800ms debounce

    return () => clearTimeout(timeout);
  }, [watchPostalCode, watchCountry, setValue, getValues]);

  if (isCartLoading && !createdOrder) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center py-20 px-4">
        <div className="w-10 h-10 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-neutral-600 font-medium text-sm">Preparing your checkout...</p>
      </div>
    );
  }

  if ((!cart || cart.items.length === 0) && !createdOrder) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center py-20 px-4">
        <div className="max-w-md w-full bg-white border border-emerald-800/15 rounded-3xl p-8 text-center shadow-xl shadow-emerald-950/5">
          <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-800 mx-auto mb-5 border border-emerald-800/20">
            <ShoppingBag className="w-10 h-10 text-emerald-800" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-neutral-900 mb-2">Your Cart is Empty</h2>
          <p className="text-neutral-600 text-xs leading-relaxed mb-6">
            You don't have any items in your shopping cart to checkout. Add 100% natural Kosmico Monk Fruit Sweetener to get started!
          </p>
          <Link to="/shop">
            <Button className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm rounded-xl shadow-md">
              Browse Kosmico Products (₹387)
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const itemsToCalculate = cart?.items || createdOrder?.items || [];
  const subtotal = itemsToCalculate.reduce((sum: number, item: any) => sum + ((item.priceSnapshot || item.price) * item.quantity), 0);
  const shipping = createdOrder ? createdOrder.shippingCost : (subtotal >= 499 ? 0 : 49);
  const tax = createdOrder ? createdOrder.taxAmount : 0;
  const total = createdOrder ? createdOrder.total : (subtotal + shipping + tax);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const processPayment = async (order: any, data: AddressFormValues) => {
    setIsPaymentProcessing(true);
    const res = await loadRazorpay();
    if (!res) {
      setError('Razorpay SDK failed to load. Are you online? You can retry payment later from your Orders page.');
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
              onSuccess: () => {
                navigate(`/order-success/${order.orderNumber}`);
              },
              onError: (err: any) => {
                setError(err.response?.data?.message || 'Payment verification failed. Please contact support.');
                setIsPaymentProcessing(false);
              },
              onSettled: () => setIsPaymentProcessing(false)
            });
          },
          prefill: {
            name: user?.name || data.fullName,
            email: user?.email,
            contact: data.phone,
          },
          theme: {
            color: '#c25e00',
          },
          modal: {
            ondismiss: function() {
              setIsPaymentProcessing(false);
              setError('Payment was cancelled. You can complete your payment now by clicking Place Order, or later from the Orders dashboard.');
            }
          }
        };

        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.open();
      },
      onError: (err: any) => {
        setError(err.response?.data?.message || 'Payment creation failed.');
        setIsPaymentProcessing(false);
      }
    });
  };

  const onSubmit = async (data: AddressFormValues) => {
    setError(null);
    if (createdOrder) {
      if (paymentMethod === 'COD') {
        navigate(`/order-success/${createdOrder.orderNumber}`);
        return;
      }
      // Retry payment if order is already created
      await processPayment(createdOrder, data);
      return;
    }

    try {
      const order = await createOrderMutation.mutateAsync({
        shippingAddress: data,
        billingAddress: data,
        paymentMethod: paymentMethod
      });
      setCreatedOrder(order);
      
      if (paymentMethod === 'COD') {
        navigate(`/order-success/${order.orderNumber}`);
      } else {
        await processPayment(order, data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    }
  };

  return (
    <div className="bg-background min-h-screen py-12">
      <Container>
        <h1 className="font-serif text-4xl font-bold text-primary mb-8">Checkout</h1>
        
        {error && (
          <div className="bg-error/10 text-error p-4 rounded-lg mb-8 border border-error/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col lg:flex-row gap-12">
          {/* Form */}
          <div className="w-full lg:w-2/3">
            <div className="bg-surface rounded-2xl border border-border p-8 mb-8">
              <h2 className="text-xl font-bold text-text-main mb-6">Shipping Address</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-main mb-2">Full Name</label>
                  <input
                    {...register('fullName')}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                  />
                  {errors.fullName && <p className="text-error text-sm mt-1">{errors.fullName.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-main mb-2">Phone</label>
                  <input
                    {...register('phone')}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                  />
                  {errors.phone && <p className="text-error text-sm mt-1">{errors.phone.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-main mb-2">Address Line 1</label>
                  <input
                    {...register('addressLine1')}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                  />
                  {errors.addressLine1 && <p className="text-error text-sm mt-1">{errors.addressLine1.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-main mb-2">Address Line 2 (Optional)</label>
                  <input
                    {...register('addressLine2')}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">City</label>
                  <input
                    {...register('city')}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                  />
                  {errors.city && <p className="text-error text-sm mt-1">{errors.city.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">State / Province</label>
                  <input
                    {...register('state')}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                  />
                  {errors.state && <p className="text-error text-sm mt-1">{errors.state.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">Postal Code</label>
                  <input
                    {...register('postalCode')}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                  />
                  {errors.postalCode && <p className="text-error text-sm mt-1">{errors.postalCode.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">Country</label>
                  <select
                    {...register('country')}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="IN">India</option>
                    <option value="GB">United Kingdom</option>
                    <option value="AU">Australia</option>
                  </select>
                  {errors.country && <p className="text-error text-sm mt-1">{errors.country.message}</p>}
                </div>
              </div>
            </div>
            
            <div className="bg-surface rounded-2xl border border-border p-8">
              <h2 className="text-xl font-bold text-text-main mb-2">Select Payment Method</h2>
              <p className="text-sm text-text-muted mb-6">Choose how you would like to pay for your order.</p>

              <div className="space-y-4">
                {/* Online Payment Option */}
                <label
                  onClick={() => setPaymentMethod('ONLINE')}
                  className={`flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'ONLINE'
                      ? 'border-primary bg-emerald-50/50 shadow-md'
                      : 'border-border bg-background hover:border-emerald-800/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="ONLINE"
                    checked={paymentMethod === 'ONLINE'}
                    onChange={() => setPaymentMethod('ONLINE')}
                    className="mt-1 accent-emerald-800 h-4 w-4"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-base text-neutral-900">💳 Online Payment (Razorpay)</span>
                      <span className="text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-800 px-2 py-0.5 rounded-full">Instant</span>
                    </div>
                    <p className="text-xs text-neutral-600 mt-1">
                      Pay instantly using Google Pay, PhonePe, Paytm, UPI, Credit/Debit Cards, or NetBanking.
                    </p>
                  </div>
                </label>

                {/* Cash on Delivery (COD) Option */}
                <label
                  onClick={() => setPaymentMethod('COD')}
                  className={`flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-primary bg-emerald-50/50 shadow-md'
                      : 'border-border bg-background hover:border-emerald-800/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="mt-1 accent-emerald-800 h-4 w-4"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-base text-neutral-900">💵 Cash on Delivery (COD)</span>
                      <span className="text-[10px] font-extrabold uppercase bg-emerald-800/10 text-emerald-800 px-2 py-0.5 rounded-full">Pay at Doorstep</span>
                    </div>
                    <p className="text-xs text-neutral-600 mt-1">
                      Pay in cash when your order is delivered to your address. No advance payment required!
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-1/3">
            <div className="bg-surface rounded-2xl border border-border p-8 sticky top-24 shadow-sm">
              <h2 className="font-serif text-2xl font-bold mb-6">Order Summary</h2>
              
              <ul className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
                {(cart?.items || createdOrder?.items || []).map((item: any) => {
                  const prod = typeof item.product === 'object' && item.product !== null ? item.product : {};
                  const productId = prod._id || (typeof item.product === 'string' ? item.product : 'item');
                  const imageSrc = Array.isArray(prod.images) && prod.images.length > 0 
                    ? prod.images[0] 
                    : '/assets/products/product-box.jpg';
                  const productName = prod.name || 'Kosmico Classic Monk Fruit Sweetener (250ml)';

                  return (
                    <li key={`${productId}-${item.variant || 'default'}`} className="flex gap-4">
                      <div className="w-16 h-16 bg-background rounded border border-border p-1 flex-shrink-0">
                        <img 
                          src={imageSrc} 
                          alt={productName}
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <span className="text-sm font-medium line-clamp-1">{productName}</span>
                        <span className="text-sm text-text-muted">Qty: {item.quantity}</span>
                      </div>
                      <div className="flex items-center text-sm font-medium">
                        {formatINR((item.priceSnapshot || item.price || prod.price || 387) * item.quantity)}
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="space-y-4 mb-6 text-text-main border-t border-border pt-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-medium">{shipping === 0 ? 'Free' : formatINR(shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span className="font-medium">{formatINR(tax)}</span>
                </div>
              </div>
              
              <div className="border-t border-border pt-6 mb-8">
                <div className="flex justify-between items-end">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-serif font-bold text-3xl text-primary">{formatINR(total)}</span>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full py-4 text-lg rounded-full"
                disabled={isSubmitting || createOrderMutation.isPending || isPaymentProcessing}
              >
                {isPaymentProcessing
                  ? 'Connecting to Razorpay...'
                  : isSubmitting || createOrderMutation.isPending
                  ? 'Placing Order...'
                  : createdOrder
                  ? (paymentMethod === 'COD' ? 'Order Confirmed (COD)' : 'Retry Online Payment')
                  : (paymentMethod === 'COD' ? 'Place Order (Cash on Delivery)' : 'Proceed to Pay Online 💳')}
              </Button>
            </div>
          </div>
        </form>
      </Container>
    </div>
  );
};
