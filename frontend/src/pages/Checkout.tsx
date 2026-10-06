import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  Truck,
  CreditCard,
  Tag,
  ChevronRight,
  Plus,
  Check,
  X,
  ShoppingBag,
  Loader2,
  Pencil,
  Trash2,
  MapPin,
  Map,
  Home as HomeIcon
} from 'lucide-react';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { useCart } from '../hooks/useCart';
import { useProducts } from '../hooks/useProducts';
import { useVerifyPayment, useCreateRazorpayOrder, useSavedPaymentMethods, type SavedPaymentMethod } from '../hooks/usePayments';
import { PaymentMethodsModal } from '../components/PaymentMethodsModal';
import { useAuthStore } from '../store/useAuthStore';
import { formatINR } from '../utils/currency';

import { api } from '../services/api';

import { useCoupons } from '../hooks/useCoupons';
import toast from 'react-hot-toast';

interface SavedAddress {
  _id?: string;
  addressLabel?: string;
  fullName: string;
  phoneNumber: string;
  flatBuilding?: string;
  streetAddress: string;
  landmark?: string;
  areaColony?: string;
  city: string;
  state?: string;
  pincode: string;
  isDefault?: boolean;
}

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { data: cart, isLoading: isCartLoading } = useCart();
  const { data: productsData } = useProducts({ page: 1, limit: 10 });
  const liveProduct = productsData?.products?.find((p: any) => {
    const str = (p.name || p.title || p.slug || '').toLowerCase();
    return str.includes('monk') || str.includes('sweetener');
  }) || productsData?.products?.[0];

  const createRazorpayOrderMutation = useCreateRazorpayOrder();
  const verifyPaymentMutation = useVerifyPayment();
  const { data: dbCoupons } = useCoupons();
  const { user } = useAuthStore();

  // Selected payment mode: 'ONLINE' or 'COD'
  const [paymentMode, setPaymentMode] = useState<'ONLINE' | 'COD'>('ONLINE');
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  // Addresses state
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<SavedAddress | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isAddAddressFormOpen, setIsAddAddressFormOpen] = useState(false);
  const [isPincodeLoading, setIsPincodeLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // New address form state
  const [newAddress, setNewAddress] = useState<SavedAddress>({
    addressLabel: 'Home',
    fullName: user?.name || '',
    phoneNumber: '',
    flatBuilding: '',
    streetAddress: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: true,
  });

  const handleLocateOnMap = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          if (res.data && res.data.address) {
            const addr = res.data.address;
            const detectedPincode = addr.postcode ? addr.postcode.replace(/\D/g, '').slice(0, 6) : '';
            const detectedCity = addr.city || addr.town || addr.village || addr.county || addr.district || '';
            const detectedState = addr.state || '';
            const detectedFlatOrRoad = [addr.house_number, addr.building, addr.road].filter(Boolean).join(', ');
            const detectedArea = [addr.suburb, addr.neighbourhood].filter(Boolean).join(', ');

            setNewAddress((prev) => ({
              ...prev,
              pincode: detectedPincode || prev.pincode,
              city: detectedCity || prev.city,
              state: detectedState || prev.state,
              flatBuilding: detectedFlatOrRoad || prev.flatBuilding,
              streetAddress: detectedArea || prev.streetAddress,
            }));
            toast.success('Location detected successfully!');
          }
        } catch (err) {
          console.warn('Geolocation error:', err);
          toast.error('Could not detect exact address from location');
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
        toast.error('Location permission denied or unavailable');
        setIsLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Coupon state
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);

  // Payment Methods State (Matches Image 1, 2, 3)
  const { data: savedPaymentMethods = [] } = useSavedPaymentMethods();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<SavedPaymentMethod | null>(null);
  const [isPaymentMethodsModalOpen, setIsPaymentMethodsModalOpen] = useState(false);

  // Auto-select default payment method if available
  useEffect(() => {
    if (savedPaymentMethods && savedPaymentMethods.length > 0 && !selectedPaymentMethod) {
      const def = savedPaymentMethods.find((m) => m.isDefault) || savedPaymentMethods[0];
      setSelectedPaymentMethod(def);
    }
  }, [savedPaymentMethods]);

  // Delivery estimation from Shiprocket API (dynamic based on pincode & weight)
  const [deliveryEstimate, setDeliveryEstimate] = useState<{
    expectedDate: string;
    courierName: string;
    deliveryFee: number;
    gstCharge: number;
  }>({
    expectedDate: '',
    courierName: '',
    deliveryFee: 0,
    gstCharge: 0,
  });

  // Fetch saved addresses from backend
  const fetchAddresses = async () => {
    try {
      const res = await api.get('/address');
      const list = res.data?.data?.addresses ?? res.data?.data ?? (Array.isArray(res.data) ? res.data : []);

      if (Array.isArray(list) && list.length > 0) {
        setSavedAddresses(list);
        const def = list.find((a: any) => a.isDefault) || list[0];
        setSelectedAddress(def);
      } else {
        setSavedAddresses([]);
        setSelectedAddress(null);
      }
    } catch (err) {
      setSavedAddresses([]);
      setSelectedAddress(null);
    }
  };

  // Calculations
  const itemsToCalculate = cart?.items || createdOrder?.items || [];
  const subtotal = itemsToCalculate.reduce(
    (sum: number, item: any) => {
      const pId = typeof item.product === 'object'
        ? (item.product?._id || item.product?.id)
        : (item.product || item.productId || item._id || item.id);
      const matchedApiProd = productsData?.products?.find((p: any) => 
        p._id === pId || p.id === pId || p.slug === pId
      ) || liveProduct;
      const unitPrice = Number(item.priceSnapshot || item.price || matchedApiProd?.price || 499);
      return sum + unitPrice * (Number(item.quantity) || 1);
    },
    0
  );

  const deliveryFee = paymentMode === 'ONLINE' ? 0 : Number(deliveryEstimate.deliveryFee ?? 0);
  const gst = paymentMode === 'ONLINE' ? 0 : Number(deliveryEstimate.gstCharge ?? 0);
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const total = Math.max(0, subtotal - discount + deliveryFee + gst);

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  // Fetch dynamic Shiprocket delivery estimation when mode, address or cart items change
  useEffect(() => {
    const pincodeToUse = (selectedAddress?.pincode || (selectedAddress as any)?.postalCode || '').toString().trim();
    const itemsList = cart?.items || createdOrder?.items || [];
    const totalItemCount = itemsList.reduce((sum: number, it: any) => sum + (Number(it.quantity) || 1), 0) || 1;
    const estimatedWeightKg = Math.max(0.5, totalItemCount * 0.5); // 0.5 kg * total items

    if (!pincodeToUse) {
      setDeliveryEstimate({
        expectedDate: '3-5 Business Days',
        courierName: 'Shiprocket Express',
        deliveryFee: paymentMode === 'ONLINE' ? 0 : 50,
        gstCharge: paymentMode === 'ONLINE' ? 0 : 9,
      });
      return;
    }

    const fetchEstimate = async () => {
      setIsCalculatingShipping(true);
      try {
        const res = await api.post('/shiprocket/estimate-delivery', {
          deliveryPincode: pincodeToUse,
          paymentMethod: paymentMode,
          weight: estimatedWeightKg,
          totalItems: totalItemCount,
          items: itemsList,
          subtotal: subtotal,
        });
        const resData = res.data?.data || res.data;
        if (resData) {
          setDeliveryEstimate({
            expectedDate: resData.estimatedDeliveryDate || resData.expectedDate || '3-5 Days',
            courierName: resData.courierName || resData.courierPartner || 'Shiprocket Express',
            deliveryFee: typeof resData.deliveryFee === 'number' ? resData.deliveryFee : (paymentMode === 'ONLINE' ? 0 : 50),
            gstCharge: typeof resData.gstCharge === 'number' ? resData.gstCharge : (paymentMode === 'ONLINE' ? 0 : 9),
          });
        }
      } catch (e) {
        setDeliveryEstimate({
          expectedDate: '3-5 Days',
          courierName: 'Shiprocket Express',
          deliveryFee: paymentMode === 'ONLINE' ? 0 : 50,
          gstCharge: paymentMode === 'ONLINE' ? 0 : 9,
        });
      } finally {
        setIsCalculatingShipping(false);
      }
    };

    if (pincodeToUse.length >= 6) {
      fetchEstimate();
    }
  }, [paymentMode, selectedAddress?._id, selectedAddress?.pincode, cart?.items?.length, subtotal]);

  if (isCartLoading && !createdOrder) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-4 bg-[#f8faf8]">
        <Loader2 className="w-10 h-10 text-emerald-800 animate-spin mb-4" />
        <p className="text-neutral-600 font-medium text-sm">Preparing your checkout...</p>
      </div>
    );
  }

  if ((!cart || cart.items.length === 0) && !createdOrder) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-4 bg-[#f8faf8]">
        <div className="max-w-md w-full bg-white border border-emerald-800/15 rounded-3xl p-8 text-center shadow-xl shadow-emerald-950/5">
          <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-800 mx-auto mb-5 border border-emerald-800/20">
            <ShoppingBag className="w-10 h-10 text-emerald-800" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-neutral-900 mb-2">Your Cart is Empty</h2>
          <p className="text-neutral-600 text-xs leading-relaxed mb-6">
            You don't have any items in your cart. Add products to continue!
          </p>
          <Link to="/shop">
            <Button className="w-full py-3 bg-[#0a7a40] hover:bg-[#086333] text-white font-bold text-sm rounded-xl shadow-md">
              Shop Now
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const processRazorpayPayment = async (order: any) => {
    setIsPaymentProcessing(true);
    const loaded = await loadRazorpay();
    if (!loaded) {
      toast.error('Razorpay SDK failed to load. Please check your internet connection.');
      setIsPaymentProcessing(false);
      return;
    }

    const razorpayKey =
      order.keyId ||
      order.key ||
      import.meta.env.VITE_RAZORPAY_KEY_ID ||
      'rzp_live_TcH3s5Qdh4ngAp';

    const calculatedPaise = Math.max(
      100,
      order.amount && order.amount >= 100
        ? order.amount
        : Math.round((order.total || total || 0) * 100)
    );

    const rzpOrderId =
      order?.order?.id ||
      order?.orderId ||
      order?.providerOrderId ||
      order?.razorpayOrderId ||
      order?.id ||
      (order?.data && (order.data?.order?.id || order.data?.orderId || order.data?.providerOrderId)) ||
      undefined;

    const options: any = {
      key: razorpayKey,
      amount: calculatedPaise,
      currency: order.currency || order?.order?.currency || 'INR',
      name: 'Kosmico Wellness',
      description: `Order ${order.orderNumber || order?.order?.id || ''}`,
      order_id: rzpOrderId,
      prefill: {
        name: selectedAddress?.fullName || user?.name || 'Customer',
        email: user?.email || '',
        contact: selectedAddress?.phoneNumber || (user as any)?.phoneNumber || (user as any)?.phone || '',
      },
      theme: {
        color: '#0a7a40',
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
          toast.error('Payment cancelled. Your order was not placed.');
        },
      },
      handler: async function (response: any) {
        setIsPaymentProcessing(true);
        const paymentId =
          response?.razorpay_payment_id ||
          response?.razorpayPaymentId ||
          response?.payment_id ||
          response?.paymentId;
        const respOrderId =
          response?.razorpay_order_id ||
          response?.razorpayOrderId ||
          response?.order_id ||
          rzpOrderId ||
          order?.order?.id ||
          order?.orderId ||
          order?.providerOrderId ||
          '';
        const signature =
          response?.razorpay_signature ||
          response?.razorpaySignature ||
          response?.signature ||
          '';

        if (!paymentId) {
          setIsPaymentProcessing(false);
          toast.error('Payment verification failed: Incomplete payment response. Order was not placed.');
          return;
        }

        try {
          const verifyRes = await verifyPaymentMutation.mutateAsync({
            razorpay_order_id: respOrderId,
            razorpay_payment_id: paymentId,
            razorpay_signature: signature,
          });

          const finalOrder = verifyRes?.order || verifyRes?.data?.order || order?.order || order;
          const finalOrderNum =
            finalOrder?._id ||
            order?._id ||
            finalOrder?.orderNumber ||
            verifyRes?.orderNumber ||
            order?.orderNumber ||
            'KW-SUCCESS';

          // ONLY after successful backend verification:
          localStorage.removeItem('kosmico_cart_v1');
          localStorage.setItem('kosmico_last_payment_method', 'ONLINE');
          localStorage.setItem('kosmico_last_order_id', String(finalOrderNum));
          localStorage.setItem('kosmico_last_order_total', String(total || finalOrder?.total || 499));
          setIsPaymentProcessing(false);
          toast.success('Payment successful! Order placed.');
          navigate(`/order-success/${finalOrderNum}`);
        } catch (verifyErr: any) {
          setIsPaymentProcessing(false);
          console.error('Payment verification error:', verifyErr);
          toast.error(
            verifyErr?.response?.data?.message ||
              'Payment verification failed. Your order has not been placed. Please contact support.'
          );
        }
      },
    };

    if (rzpOrderId) {
      options.order_id = rzpOrderId;
    }

    try {
      const rzpInstance = new (window as any).Razorpay(options);
      rzpInstance.on('payment.failed', function (resp: any) {
        setIsPaymentProcessing(false);
        toast.error(resp.error?.description || 'Payment failed. Your order was not placed.');
      });
      rzpInstance.open();
    } catch (rzpErr: any) {
      console.error('Razorpay open error:', rzpErr);
      setIsPaymentProcessing(false);
      toast.error('Unable to initialize Razorpay checkout. Please try again.');
    }
  };

  const processRazorpayCodAdvance = async (advanceAmount: number, orderPayload: any) => {
    setIsPaymentProcessing(true);
    const loaded = await loadRazorpay();
    if (!loaded) {
      toast.error('Razorpay SDK failed to load. Please check your internet connection.');
      setIsPaymentProcessing(false);
      return;
    }

    try {
      // 1. Create COD upfront order on backend via POST /api/payment/cod-upfront/create
      let upfrontData: any = null;
      try {
        const upfrontRes = await api.post('/payment/cod-upfront/create', {
          ...orderPayload,
          amount: advanceAmount,
          upfrontAmount: advanceAmount,
          total: total,
          subtotal: subtotal,
          deliveryFee,
          gstCharge: gst,
          paymentMethod: 'COD_UPFRONT',
          isCOD: true,
        });
        upfrontData = upfrontRes.data?.data || upfrontRes.data;
      } catch (createErr) {
        const fallbackRes = await api.post('/order/place/razorpay', {
          ...orderPayload,
          amount: advanceAmount,
          upfrontAmount: advanceAmount,
          total: total,
          subtotal: subtotal,
          deliveryFee,
          gstCharge: gst,
          paymentMethod: 'COD_UPFRONT',
          isCOD: true,
        });
        upfrontData = fallbackRes.data?.data || fallbackRes.data;
      }

      const rzpOrderId =
        upfrontData?.orderId ||
        upfrontData?.providerOrderId ||
        upfrontData?.order?.id ||
        (upfrontData?.data && (upfrontData.data?.orderId || upfrontData.data?.providerOrderId));
      const internalOrderId =
        upfrontData?.internalOrderId ||
        upfrontData?.order?._id ||
        upfrontData?._id;
      const orderNumber =
        upfrontData?.orderNumber ||
        upfrontData?.order?.orderNumber ||
        internalOrderId ||
        '';

      const razorpayKey =
        upfrontData?.keyId ||
        upfrontData?.key ||
        import.meta.env.VITE_RAZORPAY_KEY_ID ||
        'rzp_live_TcH3s5Qdh4ngAp';

      const calculatedPaise = Math.max(100, Math.round(advanceAmount * 100));

      const options: any = {
        key: razorpayKey,
        amount: upfrontData?.amount || calculatedPaise,
        currency: upfrontData?.currency || 'INR',
        name: 'Kosmico Wellness',
        description: 'Advance Delivery & GST for COD Order',
        order_id: rzpOrderId, // Mandatory for Razorpay UPI on mobile
        prefill: {
          name: selectedAddress?.fullName || user?.name || 'Customer',
          email: user?.email || '',
          contact: selectedAddress?.phoneNumber || (user as any)?.phoneNumber || (user as any)?.phone || '',
        },
        theme: { color: '#0a7a40' },
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
          ondismiss: async function () {
            setIsPaymentProcessing(false);
            if (rzpOrderId) {
              try {
                // Point 5: Cancel Pending Razorpay Popup
                await api.post('/payment/razorpay/cancel-pending', {
                  orderId: rzpOrderId,
                  internalOrderId,
                });
              } catch (_) {}
            }
            toast.error('Advance payment cancelled. Your COD order was not placed.');
          },
        },
        handler: async function (response: any) {
          setIsPaymentProcessing(true);
          const paymentId =
            response?.razorpay_payment_id ||
            response?.razorpayPaymentId ||
            response?.payment_id ||
            response?.paymentId;
          const respOrderId =
            response?.razorpay_order_id ||
            response?.razorpayOrderId ||
            response?.order_id ||
            rzpOrderId ||
            '';
          const signature =
            response?.razorpay_signature ||
            response?.razorpaySignature ||
            response?.signature ||
            '';

          if (!paymentId) {
            setIsPaymentProcessing(false);
            toast.error('Advance payment failed: Missing payment details. Order was not placed.');
            return;
          }

          try {
            // Success: Call POST /api/payment/cod-upfront/verify
            let verifyRes: any = null;
            try {
              const res = await api.post('/payment/cod-upfront/verify', {
                razorpay_order_id: respOrderId,
                razorpay_payment_id: paymentId,
                razorpay_signature: signature,
              });
              verifyRes = res.data?.data ?? res.data;
            } catch (vErr) {
              const fallbackRes = await api.post('/payment/razorpay/verify', {
                razorpay_order_id: respOrderId,
                razorpay_payment_id: paymentId,
                razorpay_signature: signature,
              });
              verifyRes = fallbackRes.data?.data ?? fallbackRes.data;
            }

            const placedOrder = verifyRes?.order || verifyRes?.data?.order || upfrontData?.order || null;
            const finalNum =
              placedOrder?._id ||
              placedOrder?.id ||
              verifyRes?.orderId ||
              verifyRes?.data?.orderId ||
              internalOrderId ||
              placedOrder?.orderNumber ||
              orderNumber ||
              'KW-SUCCESS';

            localStorage.removeItem('kosmico_cart_v1');
            localStorage.setItem('kosmico_last_payment_method', 'COD');
            localStorage.setItem('kosmico_last_order_id', String(finalNum));
            localStorage.setItem('kosmico_last_order_total', String(total || placedOrder?.total || 499));
            setIsPaymentProcessing(false);
            toast.success('Advance payment successful! COD Order placed.');
            navigate(`/order-success/${finalNum}`);
          } catch (placeErr: any) {
            setIsPaymentProcessing(false);
            console.error('COD Order creation error:', placeErr);
            toast.error(
              placeErr?.response?.data?.message ||
                'Payment received but failed to record order. Please contact support with Payment ID: ' + paymentId
            );
          }
        },
      };

      const rzpInstance = new (window as any).Razorpay(options);
      rzpInstance.on('payment.failed', function (resp: any) {
        setIsPaymentProcessing(false);
        toast.error(resp.error?.description || 'Advance payment failed. Your COD order was not placed.');
      });
      rzpInstance.open();
    } catch (rzpErr: any) {
      console.error('Razorpay open error:', rzpErr);
      setIsPaymentProcessing(false);
      toast.error(rzpErr?.response?.data?.message || 'Unable to initialize Razorpay checkout for COD advance.');
    }
  };

  const handlePlaceOrder = async () => {
    toast.dismiss();
    if (!selectedAddress) {
      toast.error('Please select or add a shipping address.');
      return;
    }


    const itemsToOrder = (cart?.items || []).map((it: any) => {
      const pId = typeof it.product === 'object'
        ? (it.product?._id || it.product?.id)
        : (it.product || it.productId || it._id || it.id);

      const matchedApiProd = productsData?.products?.find((p: any) => 
        p._id === pId || p.id === pId || p.slug === pId
      ) || liveProduct;

      const finalProductId = String(matchedApiProd?._id || pId || '').trim();
      const finalPrice = Number(it.price || it.priceSnapshot || matchedApiProd?.price || 499);
      const finalName = matchedApiProd?.name || it.product?.name || it.name || 'Sweet Monk (Monk Fruit Sweetener 10ml)';
      const finalImage = (matchedApiProd?.images && matchedApiProd.images[0]) || matchedApiProd?.image || it.image || it.product?.image || '';

      return {
        productId: finalProductId,
        product: finalProductId,
        quantity: Number(it.quantity) || 1,
        qty: Number(it.quantity) || 1,
        price: finalPrice,
        variant: it.variant || 'Single Pack (10ml Bottle)',
        name: finalName,
        image: finalImage,
      };
    }).filter((it) => it.productId && it.productId.length > 0 && it.productId !== 'undefined');

    if (itemsToOrder.length === 0) {
      toast.error('Your cart is empty or valid product items were not found.');
      return;
    }

    try {
      setIsPaymentProcessing(true);

      const payload = {
        amount: total,
        total: total,
        deliveryAddressId: selectedAddress._id!,
        shippingAddress: selectedAddress,
        deliveryAddress: selectedAddress,
        items: itemsToOrder,
        couponCode: appliedCoupon?.code || undefined,
        discountAmount: discount,
        deliveryFee,
        gstCharge: gst,
        paymentMethod: paymentMode === 'COD' ? 'COD_UPFRONT' : 'ONLINE',
        isCOD: paymentMode === 'COD',
      };

      if (paymentMode === 'COD') {
        const advanceAmount = Math.max(1, deliveryFee + gst);
        // Do NOT create order in DB upfront. Only create order after advance payment succeeds!
        await processRazorpayCodAdvance(advanceAmount, payload);
      } else {
        const order = await createRazorpayOrderMutation.mutateAsync(payload);
        setCreatedOrder(order);
        await processRazorpayPayment(order);
      }
    } catch (err: any) {
      setIsPaymentProcessing(false);
      toast.error(err.response?.data?.message || 'Failed to initialize payment. Please try again.');
    }
  };

  const handleApplyCoupon = async (code: string) => {
    toast.dismiss();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      toast.error('Please enter a coupon code');
      return;
    }

    try {
      const res = await api.post('/coupons/verify', { code: cleanCode, orderAmount: subtotal });
      const disc = res.data?.data?.discountAmount ?? 0;
      setAppliedCoupon({ code: cleanCode, discount: disc });
      setIsCouponModalOpen(false);
      return;
    } catch (apiErr: any) {
      const serverMsg = apiErr.response?.data?.message;
      if (serverMsg) {
        toast.error(serverMsg);
        return;
      }
    }

    const matchedCoupon = dbCoupons?.find((c) => c.code === cleanCode && c.isActive);
    if (matchedCoupon) {
      if (matchedCoupon.minOrderAmount && subtotal < matchedCoupon.minOrderAmount) {
        toast.error(`Minimum order amount of ₹${matchedCoupon.minOrderAmount} required for this coupon`);
        return;
      }
      let disc = 0;
      if (matchedCoupon.discountType === 'percentage') {
        disc = Math.round((subtotal * matchedCoupon.discountValue) / 100);
        if (matchedCoupon.maxDiscount && disc > matchedCoupon.maxDiscount) {
          disc = matchedCoupon.maxDiscount;
        }
      } else {
        disc = matchedCoupon.discountValue;
      }
      disc = Math.min(disc, subtotal);
      setAppliedCoupon({ code: matchedCoupon.code, discount: disc });
      setIsCouponModalOpen(false);
      return;
    }

    toast.error('Invalid or expired coupon code');
  };

  const handleEditAddress = (addr: SavedAddress, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAddressId(addr._id || null);

    // Accurately map mandatory Flat/Building vs optional Area/Landmark
    const rawFlat = addr.flatBuilding || (addr as any).houseNo || (addr as any).apartment || (addr as any).flat || (addr as any).building || '';
    const rawLandmark = (addr as any).landmark || (addr as any).areaColony || (addr as any).colony || (addr as any).area || (addr as any).addressLine2 || '';

    let flatVal = rawFlat;
    let areaVal = rawLandmark;

    if (!flatVal && addr.streetAddress) {
      // If flatBuilding was empty in DB, the primary streetAddress is the flat/house details!
      flatVal = addr.streetAddress;
      areaVal = rawLandmark;
    } else if (flatVal && addr.streetAddress && flatVal !== addr.streetAddress && !areaVal) {
      areaVal = addr.streetAddress;
    }

    setNewAddress({
      _id: addr._id,
      addressLabel: addr.addressLabel || 'Home',
      fullName: addr.fullName,
      phoneNumber: addr.phoneNumber || (addr as any).phone || '',
      flatBuilding: flatVal,
      streetAddress: areaVal,
      city: addr.city,
      state: addr.state || '',
      pincode: addr.pincode || (addr as any).postalCode || '',
      isDefault: addr.isDefault || false,
    });
    setIsAddAddressFormOpen(true);
  };

  const handleDeleteAddress = async (addrId?: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!addrId) return;

    if (!window.confirm('Are you sure you want to delete this address?')) return;

    try {
      await api.delete(`/address/${addrId}`);
      setSavedAddresses((prev) => {
        const remaining = prev.filter((a) => a._id !== addrId);
        if (selectedAddress?._id === addrId) {
          setSelectedAddress(remaining.length > 0 ? remaining[0] : null);
        }
        return remaining;
      });
    } catch (err) {
      console.error('Failed to delete address:', err);
      // Fallback local filter
      setSavedAddresses((prev) => prev.filter((a) => a._id !== addrId));
    }
  };

  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.fullName || !newAddress.phoneNumber || !newAddress.flatBuilding || !newAddress.pincode || !newAddress.city) {
      toast.error('Please fill in all required address fields.');
      return;
    }

    const flat = (newAddress.flatBuilding || '').trim();
    const area = (newAddress.streetAddress || '').trim();

    const addressPayload = {
      addressLabel: (newAddress.addressLabel || 'Home').trim(),
      fullName: newAddress.fullName.trim(),
      flatBuilding: flat,
      streetAddress: area || flat,
      landmark: area,
      areaColony: area,
      city: newAddress.city.trim(),
      state: (newAddress.state || '').trim(),
      pincode: newAddress.pincode.trim(),
      phoneNumber: newAddress.phoneNumber.trim(),
      isDefault: newAddress.isDefault,
    };

    try {
      if (editingAddressId) {
        // Edit existing address
        const res = await api.put(`/address/${editingAddressId}`, addressPayload);
        const updated = res.data?.data || { ...addressPayload, _id: editingAddressId, isDefault: newAddress.isDefault };
        setSavedAddresses((prev) =>
          prev.map((a) => (a._id === editingAddressId ? updated : a))
        );
        if (selectedAddress?._id === editingAddressId) {
          setSelectedAddress(updated);
        }
        toast.success('Address updated successfully');
      } else {
        // Create new address
        const res = await api.post('/address', addressPayload);
        const created = res.data?.data || { ...addressPayload, isDefault: newAddress.isDefault };
        setSavedAddresses((prev) => [created, ...prev]);
        setSelectedAddress(created);
        toast.success('Address saved successfully');
      }
      setEditingAddressId(null);
      setIsAddAddressFormOpen(false);
      setIsAddressModalOpen(false);
    } catch (err) {
      if (editingAddressId) {
        setSavedAddresses((prev) =>
          prev.map((a) => (a._id === editingAddressId ? { ...newAddress, _id: editingAddressId } : a))
        );
        if (selectedAddress?._id === editingAddressId) {
          setSelectedAddress({ ...newAddress, _id: editingAddressId });
        }
      } else {
        setSelectedAddress(newAddress);
        setSavedAddresses((prev) => [newAddress, ...prev]);
      }
      setEditingAddressId(null);
      setIsAddAddressFormOpen(false);
      setIsAddressModalOpen(false);
    }
  };

  return (
    <div className="bg-[#f6f9f6] min-h-screen pb-32 pt-4 md:py-8 font-sans">
      <Container className="max-w-xl mx-auto px-4">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-700 hover:bg-neutral-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-serif font-bold text-xl text-neutral-900">Checkout</h1>
          <div className="w-10" />
        </div>

        {/* 1. Shipping Address Card */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-base text-neutral-900">Shipping Address</h2>
            <button
              onClick={() => {
                setIsAddAddressFormOpen(false);
                setIsAddressModalOpen(true);
              }}
              className="text-[#0a7a40] font-bold text-sm hover:underline cursor-pointer"
            >
              {selectedAddress ? 'Change' : '+ Add Address'}
            </button>
          </div>

          {selectedAddress ? (
            <div className="space-y-1.5 text-neutral-700 text-sm">
              <div className="flex items-center gap-2">
                <span className="bg-[#0e7440] text-white text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full">
                  {selectedAddress.addressLabel || (selectedAddress as any).type || 'HOME'}
                </span>
                {selectedAddress.isDefault && (
                  <span className="bg-neutral-100 text-neutral-700 text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                    Default
                  </span>
                )}
              </div>
              <p className="font-bold text-neutral-900 text-base">
                {selectedAddress.fullName || user?.name || ''}
              </p>
              <p className="text-neutral-600 text-xs leading-relaxed">
                {selectedAddress.flatBuilding ? `${selectedAddress.flatBuilding}, ` : ''}
                {selectedAddress.streetAddress || (selectedAddress as any).addressLine1 || ''}
                {selectedAddress.city ? `, ${selectedAddress.city}` : ''}
                {selectedAddress.state ? `, ${selectedAddress.state}` : ''}
                {selectedAddress.pincode ? ` - ${selectedAddress.pincode}` : ''}
              </p>
              {selectedAddress.phoneNumber && (
                <p className="text-neutral-700 font-medium text-xs">
                  📞 {selectedAddress.phoneNumber}
                </p>
              )}
            </div>
          ) : (
            <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl text-center space-y-2.5">
              <p className="text-xs text-amber-900 font-medium">No saved delivery address found in your account.</p>
              <button
                type="button"
                onClick={() => {
                  setIsAddAddressFormOpen(true);
                  setIsAddressModalOpen(true);
                }}
                className="px-4 py-2 bg-[#0a7a40] hover:bg-[#086333] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Delivery Address</span>
              </button>
            </div>
          )}

          {/* Expected Delivery Date Banner */}
          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center gap-2 text-xs font-semibold text-[#0a7a40]">
            <Truck className="w-4 h-4 text-[#0a7a40] flex-shrink-0 animate-pulse" />
            <span>
              {isCalculatingShipping
                ? 'Calculating delivery date...'
                : `Expected: ${deliveryEstimate.expectedDate}`}
            </span>
          </div>
        </div>

        {/* 2. Payment Mode Selector (Exact App Design) */}
        {/* 2. Payment Mode Selector (Exact Screenshot Design) */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 mb-4 shadow-sm">
          <h2 className="font-bold text-base text-neutral-900 mb-3">Payment Mode</h2>

          <div className="space-y-3">
            {/* 1. Online Payment Card (Solid Emerald Green) */}
            <div
              onClick={() => setPaymentMode('ONLINE')}
              className={`relative p-4 rounded-2xl transition-all cursor-pointer flex items-center justify-between ${
                paymentMode === 'ONLINE'
                  ? 'bg-[#0e7440] text-white shadow-md border-2 border-[#0e7440]'
                  : 'border-2 border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    paymentMode === 'ONLINE' ? 'text-white' : 'bg-neutral-100 text-neutral-700'
                  }`}
                >
                  <CreditCard className="w-6 h-6 stroke-[1.75]" />
                </div>
                <div>
                  <h3
                    className={`font-bold text-sm md:text-base ${
                      paymentMode === 'ONLINE' ? 'text-white' : 'text-neutral-900'
                    }`}
                  >
                    Online Payment
                  </h3>
                  <p
                    className={`text-xs mt-0.5 ${
                      paymentMode === 'ONLINE' ? 'text-white/90' : 'text-neutral-500'
                    }`}
                  >
                    Pay full amount securely via UPI, Cards, NetBanking
                  </p>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  paymentMode === 'ONLINE' ? 'border-white' : 'border-neutral-300'
                }`}
              >
                {paymentMode === 'ONLINE' && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
              </div>
            </div>

            {/* 2. Cash on Delivery Card (Terracotta / Warm Brown) */}
            <div className="relative pt-1.5">
              {/* Floating Top-Right Green Badge */}
              <div className="absolute -top-1.5 right-4 z-10 bg-[#00a86b] text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-sm">
                Pay ₹{deliveryFee + gst} now. Rest on delivery
              </div>

              <div
                onClick={() => setPaymentMode('COD')}
                className={`relative p-4 rounded-2xl transition-all cursor-pointer overflow-hidden ${
                  paymentMode === 'COD'
                    ? 'bg-[#965726] text-white shadow-md border-2 border-[#965726]'
                    : 'border-2 border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        paymentMode === 'COD' ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3
                        className={`font-bold text-sm ${
                          paymentMode === 'COD' ? 'text-white' : 'text-neutral-900'
                        }`}
                      >
                        Cash on Delivery
                      </h3>
                      <p
                        className={`text-xs mt-0.5 ${
                          paymentMode === 'COD' ? 'text-[#f3e8df]' : 'text-neutral-500'
                        }`}
                      >
                        Delivery + GST amount non-refundable
                      </p>
                    </div>
                  </div>

                  <div className="text-right pl-2 shrink-0">
                    <div
                      className={`text-lg font-black tracking-tight font-sans ${
                        paymentMode === 'COD' ? 'text-white' : 'text-neutral-900'
                      }`}
                    >
                      ₹{deliveryFee + gst}
                    </div>
                    <div
                      className={`text-[10px] font-medium ${
                        paymentMode === 'COD' ? 'text-[#f3e8df]' : 'text-neutral-400'
                      }`}
                    >
                      pay now
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Payment Method Card (Temporarily commented out, can be re-enabled later) */}
        {/* <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-base text-neutral-900">Payment Method</h2>
            <button
              type="button"
              onClick={() => setIsPaymentMethodsModalOpen(true)}
              className="text-[#0a7a40] font-bold text-sm hover:underline cursor-pointer"
            >
              Change
            </button>
          </div>

          <div
            onClick={() => setIsPaymentMethodsModalOpen(true)}
            className="relative overflow-hidden p-4.5 rounded-2xl bg-[#0e7440] text-white shadow-md cursor-pointer transition-all hover:bg-[#0b5e34] group"
          >
            <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div className="inline-block px-2.5 py-0.5 bg-white/20 text-white text-[11px] font-semibold rounded-full mb-1">
                  UPI
                </div>
                <p className="font-bold text-base md:text-lg text-white font-sans tracking-wide">
                  {selectedPaymentMethod?.upiId || (user?.phoneNumber ? `${user.phoneNumber}@ybl` : '8004116370@ybl')}
                </p>
                <p className="text-[11px] font-bold uppercase text-emerald-100/90 tracking-wide mt-0.5">
                  {selectedPaymentMethod?.displayName || user?.name || 'AMIT KUMAR'}
                </p>
              </div>

              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0 shadow-xs">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
            </div>
          </div>
        </div> */}

        {/* 4. Apply Coupon Card */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-base text-neutral-900">Apply Coupon</h2>
            <button
              onClick={() => setIsCouponModalOpen(true)}
              className="text-[#0a7a40] font-bold text-sm hover:underline"
            >
              {appliedCoupon ? 'Remove' : 'Change'}
            </button>
          </div>

          <div
            onClick={() => setIsCouponModalOpen(true)}
            className="flex items-center justify-between p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Tag className="w-5 h-5 text-[#0a7a40]" />
              <div>
                {appliedCoupon ? (
                  <p className="text-sm font-bold text-[#0a7a40]">
                    {appliedCoupon.code} applied (-{formatINR(appliedCoupon.discount)})
                  </p>
                ) : (
                  <p className="text-sm text-neutral-700 font-medium">Select a coupon code</p>
                )}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-neutral-400" />
          </div>
        </div>

        {/* 5. Order Summary Card */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 mb-6 shadow-sm">
          <h2 className="font-bold text-base text-neutral-900 mb-4">Order Summary</h2>

          {/* Items */}
          <div className="space-y-3 mb-4">
            {(cart?.items || createdOrder?.items || []).map((item: any, idx: number) => {
              const prod = typeof item.product === 'object' && item.product !== null ? item.product : {};
              const matchedApiProd = productsData?.products?.find((p: any) => 
                p._id === item.productId || p.id === item.productId || p.slug === item.productId
              ) || liveProduct;

              const productName = matchedApiProd?.name || prod.name || item.name || 'Sweet Monk (Monk Fruit Sweetener 10ml)';
              const productImage = (matchedApiProd?.images && matchedApiProd.images[0]) || matchedApiProd?.image || item.image || prod.image || '/assets/products/product-box.jpg';
              const variantName = item.variant || 'Single Pack (10ml Bottle)';
              const itemPrice = item.priceSnapshot || item.price || matchedApiProd?.price || prod.price || 499;

              return (
                <div key={idx} className="flex items-center gap-3.5 p-3 rounded-xl bg-neutral-50 border border-neutral-200/70">
                  <div className="w-14 h-14 rounded-lg bg-white border border-neutral-200/80 p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img
                      src={productImage}
                      alt={productName}
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-neutral-900 leading-snug line-clamp-1">
                      {productName}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                        {variantName}
                      </span>
                      <span className="text-xs text-neutral-500 font-medium">
                        Qty: {item.quantity}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-bold text-sm text-neutral-900">
                      {formatINR(itemPrice * item.quantity)}
                    </span>
                    <p className="text-[11px] text-neutral-400">
                      {formatINR(itemPrice)} each
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-neutral-100 pt-3 space-y-2.5 text-sm">
            <div className="flex justify-between text-neutral-600">
              <span>Subtotal</span>
              <span className="font-bold text-neutral-900">{formatINR(subtotal)}</span>
            </div>

            {appliedCoupon && (
              <div className="flex justify-between text-[#0a7a40]">
                <span>Coupon Discount</span>
                <span className="font-bold">-{formatINR(appliedCoupon.discount)}</span>
              </div>
            )}

            <div className="flex justify-between text-neutral-600">
              <span className="flex items-center gap-1.5">
                Delivery Fee
                {isCalculatingShipping && <Loader2 className="w-3 h-3 animate-spin text-[#0a7a40]" />}
              </span>
              <span className={`font-bold ${paymentMode === 'ONLINE' ? 'text-[#0a7a40]' : 'text-neutral-900'}`}>
                {isCalculatingShipping ? 'Calculating...' : (paymentMode === 'ONLINE' ? 'FREE' : formatINR(deliveryFee))}
              </span>
            </div>

            <div className="flex justify-between text-neutral-600">
              <span className="flex items-center gap-1.5">
                GST
                {isCalculatingShipping && <Loader2 className="w-3 h-3 animate-spin text-[#0a7a40]" />}
              </span>
              <span className="font-bold text-neutral-900">
                {isCalculatingShipping ? '...' : (paymentMode === 'ONLINE' ? '₹0' : formatINR(gst))}
              </span>
            </div>
          </div>

          {deliveryEstimate.expectedDate && (
            <div className="mt-3 p-2.5 bg-emerald-50/70 border border-emerald-200/60 rounded-xl flex items-center gap-2 text-xs text-[#0a7a40]">
              <span>🚚</span>
              <span className="font-semibold text-emerald-900">
                Delivery by {deliveryEstimate.expectedDate}
              </span>
            </div>
          )}

          <div className="border-t border-neutral-100 pt-4 mt-3 flex justify-between items-center">
            <span className="font-bold text-base text-neutral-900">Total Amount</span>
            <span className={`font-bold text-2xl tracking-tight ${paymentMode === 'COD' ? 'text-[#0a7a40]' : 'text-neutral-900'}`}>
              {formatINR(total)}
            </span>
          </div>

          {/* COD Advance & Pay on Delivery Breakdown */}
          {paymentMode === 'COD' && (
            <div className="mt-4 p-4 bg-[#ede7df] border border-[#ded5c8] rounded-2xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-[#8b5e34]">
                  Pay Online Now (Delivery + GST)
                </span>
                <span className="text-sm font-bold text-neutral-900">
                  {formatINR(deliveryFee + gst)}
                </span>
              </div>

              <div className="text-xs font-semibold text-[#0a7a40]">
                • Non-Refundable advance payment
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-[#ded5c8]/60">
                <span className="text-sm font-bold text-neutral-900">
                  Pay on Delivery (Product Price)
                </span>
                <span className="text-sm font-bold text-neutral-900">
                  {formatINR(Math.max(0, subtotal - discount))}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 6. Sticky Bottom Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-neutral-200 p-4 z-40">
          <div className="max-w-xl mx-auto">
            <button
              onClick={handlePlaceOrder}
              disabled={isPaymentProcessing || createRazorpayOrderMutation.isPending}
              className="w-full py-4 bg-[#0a7a40] hover:bg-[#086333] active:scale-[0.99] text-white font-bold text-base rounded-full shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            >
              {isPaymentProcessing || createRazorpayOrderMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  {paymentMode === 'COD'
                    ? `Pay ₹${deliveryFee + gst} Online & Place Order`
                    : `Pay ${formatINR(total)} Online & Place Order`}
                </>
              )}
            </button>
          </div>
        </div>

        {/* --- ADDRESS SELECTION / ADD MODAL --- */}
        {isAddressModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end md:items-center justify-center p-0 md:p-4 overflow-y-auto">
            <div className="bg-[#f7f9f6] w-full max-w-lg rounded-t-[2rem] md:rounded-3xl p-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-neutral-200/80 my-auto">
              
              {/* Main Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200/60 mb-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (isAddAddressFormOpen) {
                        setIsAddAddressFormOpen(false);
                        setEditingAddressId(null);
                      } else {
                        setIsAddressModalOpen(false);
                      }
                    }}
                    className="p-1.5 -ml-1.5 rounded-full text-[#0a7a40] hover:bg-emerald-100/50 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h3 className="font-serif font-bold text-lg text-[#0a7a40]">
                    Shipping Addresses
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddressModalOpen(false);
                    setIsAddAddressFormOpen(false);
                    setEditingAddressId(null);
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-neutral-200 text-neutral-500 hover:bg-neutral-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {!isAddAddressFormOpen ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-sm text-neutral-900">Saved Addresses</h4>
                    <span className="text-xs text-neutral-500">
                      {savedAddresses.length} {savedAddresses.length === 1 ? 'address' : 'addresses'}
                    </span>
                  </div>

                  {savedAddresses.length === 0 ? (
                    <div className="text-center py-8 bg-white border-2 border-dashed border-neutral-200 rounded-2xl space-y-3 mb-4">
                      <MapPin className="w-8 h-8 text-neutral-300 mx-auto" />
                      <p className="text-sm font-semibold text-neutral-600">No saved addresses yet</p>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAddressId(null);
                          setNewAddress({
                            addressLabel: 'Home',
                            fullName: user?.name || '',
                            phoneNumber: user?.phoneNumber || user?.phone || '',
                            flatBuilding: '',
                            streetAddress: '',
                            city: '',
                            state: '',
                            pincode: '',
                            isDefault: true,
                          });
                          setIsAddAddressFormOpen(true);
                        }}
                        className="px-4 py-2 bg-[#0a7a40] text-white text-xs font-bold rounded-xl hover:bg-[#086333]"
                      >
                        Add Address
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 mb-5">
                      {savedAddresses.map((addr, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setSelectedAddress(addr);
                            setIsAddressModalOpen(false);
                          }}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white ${
                            selectedAddress?._id === addr._id || selectedAddress?.streetAddress === addr.streetAddress
                              ? 'border-[#0a7a40] ring-1 ring-[#0a7a40] bg-emerald-50/20'
                              : 'border-neutral-200 hover:border-neutral-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="inline-flex items-center gap-1 bg-emerald-100 text-[#0a7a40] text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md">
                                  <HomeIcon className="w-3 h-3" />
                                  {addr.addressLabel || 'HOME'}
                                </span>
                                {addr.isDefault && (
                                  <span className="text-[10px] font-bold text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                                    Default
                                  </span>
                                )}
                              </div>
                              <h4 className="font-bold text-sm text-neutral-900">{addr.fullName}</h4>
                              <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                                {addr.flatBuilding ? `${addr.flatBuilding}, ` : ''}{addr.streetAddress ? `${addr.streetAddress}, ` : ''}{addr.city}{addr.state ? `, ${addr.state}` : ''} - {addr.pincode}
                              </p>
                              <p className="text-xs text-neutral-700 font-medium mt-1.5">
                                Phone: <span className="font-bold">{addr.phoneNumber}</span>
                              </p>
                            </div>

                            <div className="flex items-center gap-1 shrink-0 ml-2">
                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={(e) => handleEditAddress(addr, e)}
                                className="p-2 rounded-xl text-neutral-400 hover:text-[#0a7a40] hover:bg-emerald-50 transition-colors"
                                title="Edit address"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={(e) => handleDeleteAddress(addr._id, e)}
                                className="p-2 rounded-xl text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Delete address"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>

                              {(selectedAddress?._id === addr._id || selectedAddress?.streetAddress === addr.streetAddress) && (
                                <Check className="w-5 h-5 text-[#0a7a40] ml-1" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setEditingAddressId(null);
                      setNewAddress({
                        addressLabel: 'Home',
                        fullName: user?.name || '',
                        phoneNumber: user?.phoneNumber || user?.phone || '',
                        flatBuilding: '',
                        streetAddress: '',
                        city: '',
                        state: '',
                        pincode: '',
                        isDefault: savedAddresses.length === 0,
                      });
                      setIsAddAddressFormOpen(true);
                    }}
                    className="w-full py-3.5 bg-white border-2 border-dashed border-[#0a7a40] text-[#0a7a40] font-bold text-sm rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-50/50 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Address
                  </button>
                </div>
              ) : (
                /* Add / Edit Address Form Container matching Screenshot */
                <div className="bg-white rounded-2xl p-5 shadow-xs border border-neutral-200/70">
                  {/* Form Subheader with Locate on Map */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-100">
                    <h3 className="font-bold text-base text-neutral-900">
                      {editingAddressId ? 'Edit Address' : 'Add New Address'}
                    </h3>
                    <button
                      type="button"
                      onClick={handleLocateOnMap}
                      disabled={isLocating}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0a7a40] hover:text-[#086333] cursor-pointer disabled:opacity-50 transition-colors"
                      title="Use GPS location"
                    >
                      {isLocating ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#0a7a40]" />
                      ) : (
                        <Map className="w-4 h-4 text-[#0a7a40]" />
                      )}
                      <span>{isLocating ? 'Locating...' : 'Locate on Map'}</span>
                    </button>
                  </div>

                  <form onSubmit={handleSaveNewAddress} className="space-y-3.5">
                    {/* Address Label */}
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Address Label (e.g. Home, Office)
                      </label>
                      <input
                        type="text"
                        value={newAddress.addressLabel}
                        onChange={(e) => setNewAddress({ ...newAddress, addressLabel: e.target.value })}
                        className="w-full px-4 py-3 bg-[#fbfcfb] border border-neutral-300 rounded-xl text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#0a7a40] focus:ring-1 focus:ring-[#0a7a40] transition-all"
                        placeholder="Home"
                        required
                      />
                    </div>

                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newAddress.fullName}
                        onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                        className="w-full px-4 py-3 bg-[#fbfcfb] border border-neutral-300 rounded-xl text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#0a7a40] focus:ring-1 focus:ring-[#0a7a40] transition-all"
                        placeholder="Full Name"
                        required
                      />
                    </div>

                    {/* Flat, House no., Building, Company, Apartment * */}
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Flat, House no., Building, Company, Apartment <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newAddress.flatBuilding || ''}
                        onChange={(e) => setNewAddress({ ...newAddress, flatBuilding: e.target.value })}
                        className="w-full px-4 py-3 bg-[#fbfcfb] border border-neutral-300 rounded-xl text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#0a7a40] focus:ring-1 focus:ring-[#0a7a40] transition-all"
                        placeholder="Flat, House no., Building, Company, Apartment *"
                        required
                      />
                    </div>

                    {/* Area, Colony, Landmark (Optional) */}
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Area, Colony, Landmark (Optional)
                      </label>
                      <input
                        type="text"
                        value={newAddress.streetAddress || ''}
                        onChange={(e) => setNewAddress({ ...newAddress, streetAddress: e.target.value })}
                        className="w-full px-4 py-3 bg-[#fbfcfb] border border-neutral-300 rounded-xl text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#0a7a40] focus:ring-1 focus:ring-[#0a7a40] transition-all"
                        placeholder="Area, Colony, Landmark (Optional)"
                      />
                    </div>

                    {/* City & Pincode Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">
                          City <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          className="w-full px-4 py-3 bg-[#fbfcfb] border border-neutral-300 rounded-xl text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#0a7a40] focus:ring-1 focus:ring-[#0a7a40] transition-all"
                          placeholder="City"
                          required
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-semibold text-neutral-700">
                            Pincode <span className="text-red-500">*</span>
                          </label>
                          {isPincodeLoading && (
                            <span className="text-[10px] text-[#0a7a40] font-bold animate-pulse">
                              Detecting...
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          maxLength={6}
                          value={newAddress.pincode}
                          onChange={async (e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            setNewAddress((prev) => ({ ...prev, pincode: val }));
                            if (val.length === 6) {
                              setIsPincodeLoading(true);
                              try {
                                const res = await axios.get(`https://api.postalpincode.in/pincode/${val}`);
                                if (res.data?.[0]?.Status === 'Success' && res.data[0].PostOffice?.length > 0) {
                                  const po = res.data[0].PostOffice[0];
                                  const detectedCity = po.District || po.Block || po.Name;
                                  const detectedState = po.State;
                                  setNewAddress((prev) => ({
                                    ...prev,
                                    pincode: val,
                                    city: detectedCity,
                                    state: detectedState,
                                  }));
                                }
                              } catch (err) {
                                console.warn('Pincode fetch error:', err);
                              } finally {
                                setIsPincodeLoading(false);
                              }
                            }
                          }}
                          className="w-full px-4 py-3 bg-[#fbfcfb] border border-neutral-300 rounded-xl text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#0a7a40] focus:ring-1 focus:ring-[#0a7a40] transition-all"
                          placeholder="Pincode"
                          required
                        />
                      </div>
                    </div>

                    {/* State */}
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        value={newAddress.state || ''}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        className="w-full px-4 py-3 bg-[#fbfcfb] border border-neutral-300 rounded-xl text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#0a7a40] focus:ring-1 focus:ring-[#0a7a40] transition-all"
                        placeholder="State"
                      />
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        maxLength={10}
                        value={newAddress.phoneNumber}
                        onChange={(e) => setNewAddress({ ...newAddress, phoneNumber: e.target.value.replace(/\D/g, '') })}
                        className="w-full px-4 py-3 bg-[#fbfcfb] border border-neutral-300 rounded-xl text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#0a7a40] focus:ring-1 focus:ring-[#0a7a40] transition-all"
                        placeholder="Phone Number"
                        required
                      />
                    </div>

                    {/* Set as Default Address (Toggle Switch) */}
                    <div className="flex items-center justify-between pt-2 pb-1">
                      <label
                        className="text-sm font-medium text-neutral-800 cursor-pointer"
                        onClick={() => setNewAddress((prev) => ({ ...prev, isDefault: !prev.isDefault }))}
                      >
                        Set as Default Address
                      </label>
                      <div
                        className={`w-12 h-6 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-200 ${
                          newAddress.isDefault ? 'bg-[#0a7a40]' : 'bg-neutral-300'
                        }`}
                        onClick={() => setNewAddress((prev) => ({ ...prev, isDefault: !prev.isDefault }))}
                      >
                        <div
                          className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform duration-200 ${
                            newAddress.isDefault ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Submit and Cancel Buttons */}
                    <div className="pt-3">
                      <button
                        type="submit"
                        className="w-full py-3.5 bg-[#0a7a40] hover:bg-[#086333] text-white font-bold text-sm sm:text-base rounded-2xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        {editingAddressId ? 'Update Address' : 'Save Address'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddAddressFormOpen(false);
                          setEditingAddressId(null);
                        }}
                        className="w-full mt-2 py-2 text-neutral-500 font-semibold text-xs hover:text-neutral-800 transition-colors text-center cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- COUPON MODAL --- */}
        {isCouponModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4">
            <div className="bg-white w-full max-w-md rounded-t-3xl md:rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
                <h3 className="font-bold text-lg text-neutral-900">Apply Coupon</h3>
                <button
                  onClick={() => setIsCouponModalOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                  placeholder="Enter Coupon Code"
                  className="flex-1 px-4 py-3 border border-neutral-300 rounded-xl text-sm font-semibold uppercase focus:outline-none focus:border-[#0a7a40]"
                />
                <button
                  type="button"
                  onClick={() => handleApplyCoupon(couponCodeInput)}
                  className="px-5 py-3 bg-[#0a7a40] text-white font-bold text-sm rounded-xl hover:bg-[#086333]"
                >
                  Apply
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">AVAILABLE COUPONS</p>
                {dbCoupons && dbCoupons.filter(c => c.isActive !== false).length > 0 ? (
                  dbCoupons.filter(c => c.isActive !== false).map((c) => (
                    <div
                      key={c.code}
                      onClick={() => handleApplyCoupon(c.code)}
                      className="p-4 bg-[#eefbf3] border border-emerald-300/80 rounded-2xl cursor-pointer hover:bg-emerald-100/70 hover:border-emerald-400 transition-all flex items-center justify-between group"
                    >
                      <div>
                        <span className="font-extrabold text-sm text-[#0a7a40] tracking-wide block">{c.code}</span>
                        <p className="text-xs text-neutral-600 mt-0.5">
                          {c.description || (c.discountType === 'percentage' ? `Get ${c.discountValue}% instant discount on your order` : `Flat ₹${c.discountValue} OFF on orders`)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyCoupon(c.code);
                        }}
                        className="text-xs font-bold text-[#0a7a40] hover:text-[#086333] hover:underline shrink-0 ml-3 cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-center space-y-1">
                    <p className="text-xs font-bold text-neutral-700">No Public Coupons Active</p>
                    <p className="text-[11px] text-neutral-500">
                      If you have a promo voucher, enter the code above and click Apply.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Payment Methods Modal (Matches Image 2 & Image 3) */}
        <PaymentMethodsModal
          isOpen={isPaymentMethodsModalOpen}
          onClose={() => setIsPaymentMethodsModalOpen(false)}
          selectedMethodId={selectedPaymentMethod?._id || selectedPaymentMethod?.id}
          onSelectMethod={(method) => setSelectedPaymentMethod(method)}
          isSelectionMode={true}
        />

      </Container>
    </div>
  );
};
