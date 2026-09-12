import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  Truck, 
  CreditCard, 
  Banknote, 
  Tag, 
  ChevronRight, 
  Plus, 
  Check, 
  X, 
  ShoppingBag, 
  Loader2, 
  Pencil,
  Trash2,
  Smartphone,
  Building2,
  Info
} from 'lucide-react';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { useCart } from '../hooks/useCart';
import { useCreateOrder } from '../hooks/useOrders';
import { useVerifyPayment } from '../hooks/usePayments';
import { useAuthStore } from '../store/useAuthStore';
import { formatINR } from '../utils/currency';

import { api } from '../services/api';

interface SavedAddress {
  _id?: string;
  addressLabel?: string;
  fullName: string;
  phoneNumber: string;
  streetAddress: string;
  city: string;
  state?: string;
  pincode: string;
  isDefault?: boolean;
}

export interface SavedPaymentMethod {
  id: string;
  type: 'UPI' | 'BANK';
  displayName: string;
  upiId?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  isDefault: boolean;
}

const DEFAULT_PAYMENT_METHODS: SavedPaymentMethod[] = [
  {
    id: 'pm-1',
    type: 'UPI',
    displayName: 'AMIT KUMAR',
    upiId: '7068368474@ybl',
    isDefault: true,
  },
  {
    id: 'pm-2',
    type: 'BANK',
    displayName: 'AMIT KUMAR',
    bankName: 'State Bank of India',
    accountNumber: '•••• •••• 5678',
    ifscCode: 'SBIN0001234',
    isDefault: false,
  },
];

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { data: cart, isLoading: isCartLoading } = useCart();
  const createOrderMutation = useCreateOrder();
  const verifyPaymentMutation = useVerifyPayment();
  const { user } = useAuthStore();

  // Selected payment mode: 'ONLINE' or 'COD'
  const [paymentMode, setPaymentMode] = useState<'ONLINE' | 'COD'>('ONLINE');
  const [error, setError] = useState<string | null>(null);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  // Online Payment Method state (UPI & Bank Account - App Exact Match)
  const [paymentMethods, setPaymentMethods] = useState<SavedPaymentMethod[]>(() => {
    const saved = localStorage.getItem('kosmico_saved_payment_methods');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_PAYMENT_METHODS;
  });

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<SavedPaymentMethod>(() => {
    return paymentMethods.find((m) => m.isDefault) || paymentMethods[0];
  });

  const [isPaymentMethodModalOpen, setIsPaymentMethodModalOpen] = useState(false);
  const [isAddingNewPaymentMethod, setIsAddingNewPaymentMethod] = useState(false);
  const [paymentTypeTab, setPaymentTypeTab] = useState<'BANK' | 'UPI'>('UPI');

  // Form states for Add Payment Method
  const [bankAccountHolder, setBankAccountHolder] = useState(user?.name || 'Amit Kumar');
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIfscCode, setBankIfscCode] = useState('');
  const [bankSetDefault, setBankSetDefault] = useState(true);

  const [upiDisplayName, setUpiDisplayName] = useState(user?.name || 'AMIT KUMAR');
  const [upiIdInput, setUpiIdInput] = useState('');
  const [upiSetDefault, setUpiSetDefault] = useState(true);

  // Save Payment Method Helper
  const handleSavePaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentTypeTab === 'UPI') {
      if (!upiIdInput.trim()) return;
      const newMethod: SavedPaymentMethod = {
        id: `pm-${Date.now()}`,
        type: 'UPI',
        displayName: (upiDisplayName || user?.name || 'AMIT KUMAR').toUpperCase(),
        upiId: upiIdInput.trim(),
        isDefault: upiSetDefault,
      };

      let updatedList = paymentMethods;
      if (upiSetDefault) {
        updatedList = updatedList.map((m) => ({ ...m, isDefault: false }));
      }
      updatedList = [newMethod, ...updatedList];
      setPaymentMethods(updatedList);
      setSelectedPaymentMethod(newMethod);
      localStorage.setItem('kosmico_saved_payment_methods', JSON.stringify(updatedList));
      setIsAddingNewPaymentMethod(false);
      setIsPaymentMethodModalOpen(false);
      setUpiIdInput('');
    } else {
      if (!bankAccountNumber.trim() || !bankIfscCode.trim()) return;
      const newMethod: SavedPaymentMethod = {
        id: `pm-${Date.now()}`,
        type: 'BANK',
        displayName: (bankAccountHolder || user?.name || 'AMIT KUMAR').toUpperCase(),
        bankName: bankName.trim() || 'Bank Account',
        accountNumber: bankAccountNumber.trim(),
        ifscCode: bankIfscCode.trim().toUpperCase(),
        isDefault: bankSetDefault,
      };

      let updatedList = paymentMethods;
      if (bankSetDefault) {
        updatedList = updatedList.map((m) => ({ ...m, isDefault: false }));
      }
      updatedList = [newMethod, ...updatedList];
      setPaymentMethods(updatedList);
      setSelectedPaymentMethod(newMethod);
      localStorage.setItem('kosmico_saved_payment_methods', JSON.stringify(updatedList));
      setIsAddingNewPaymentMethod(false);
      setIsPaymentMethodModalOpen(false);
      setBankAccountNumber('');
      setBankIfscCode('');
      setBankName('');
    }
  };

  // Addresses state
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<SavedAddress | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isAddAddressFormOpen, setIsAddAddressFormOpen] = useState(false);
  const [isPincodeLoading, setIsPincodeLoading] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // New address form state
  const [newAddress, setNewAddress] = useState<SavedAddress>({
    addressLabel: 'Home',
    fullName: user?.name || '',
    phoneNumber: '',
    streetAddress: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: true,
  });

  // Coupon state
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Delivery estimation from Shiprocket API
  const [deliveryEstimate, setDeliveryEstimate] = useState<{
    expectedDate: string;
    deliveryFee: number;
    gstCharge: number;
  }>({
    expectedDate: 'Sep 14, 2026',
    deliveryFee: 0,
    gstCharge: 0,
  });

  // Fetch saved addresses from backend
  const fetchAddresses = async () => {
    try {
      const res = await api.get('/address');
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setSavedAddresses(res.data.data);
        const def = res.data.data.find((a: any) => a.isDefault) || res.data.data[0];
        setSelectedAddress(def);
      } else {
        const defaultFallback: SavedAddress = {
          addressLabel: 'Home',
          fullName: user?.name || 'Amit',
          phoneNumber: '8004116370',
          streetAddress: 'NX-ONE, Hawelia Road, Techzone 4, Greater Noida West',
          city: 'Greater Noida',
          state: 'Uttar Pradesh',
          pincode: '201318',
          isDefault: true,
        };
        setSelectedAddress(defaultFallback);
      }
    } catch (err) {
      const defaultFallback: SavedAddress = {
        addressLabel: 'Home',
        fullName: user?.name || 'Amit',
        phoneNumber: '8004116370',
        streetAddress: 'NX-ONE, Hawelia Road, Techzone 4, Greater Noida West',
        city: 'Greater Noida',
        state: 'Uttar Pradesh',
        pincode: '201318',
        isDefault: true,
      };
      setSelectedAddress(defaultFallback);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  // Fetch dynamic Shiprocket delivery estimation when mode, address or cart items change
  useEffect(() => {
    const pincodeToUse = selectedAddress?.pincode || '201318';
    const itemsList = cart?.items || createdOrder?.items || [];
    const totalItemCount = itemsList.reduce((sum: number, it: any) => sum + (it.quantity || 1), 0) || 1;
    const estimatedWeightKg = Math.max(0.5, totalItemCount * 0.25);

    const fetchEstimate = async () => {
      setIsCalculatingShipping(true);
      try {
        const res = await api.post('/shiprocket/estimate-delivery', {
          deliveryPincode: pincodeToUse,
          paymentMethod: paymentMode,
          weight: estimatedWeightKg,
          subtotal: subtotal,
        });
        if (res.data?.data) {
          const data = res.data.data;
          setDeliveryEstimate({
            expectedDate: data.expectedDate || 'Sep 14, 2026',
            deliveryFee: typeof data.deliveryFee === 'number' ? data.deliveryFee : (paymentMode === 'ONLINE' ? 0 : 77),
            gstCharge: typeof data.gstCharge === 'number' ? data.gstCharge : (paymentMode === 'ONLINE' ? 0 : 13),
          });
        }
      } catch (err) {
        console.error('Shiprocket fetch error:', err);
      } finally {
        setTimeout(() => setIsCalculatingShipping(false), 200);
      }
    };

    fetchEstimate();
  }, [paymentMode, selectedAddress?._id, selectedAddress?.pincode, cart?.items?.length]);

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
            You don't have any items in your cart. Add 100% natural Kosmico Monk Fruit Sweetener to continue!
          </p>
          <Link to="/shop">
            <Button className="w-full py-3 bg-[#0a7a40] hover:bg-[#086333] text-white font-bold text-sm rounded-xl shadow-md">
              Browse Kosmico Products (₹387)
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Calculations
  const itemsToCalculate = cart?.items || createdOrder?.items || [];
  const subtotal = itemsToCalculate.reduce(
    (sum: number, item: any) => sum + (item.priceSnapshot || item.price || 387) * item.quantity,
    0
  );

  const deliveryFee = paymentMode === 'ONLINE' ? 0 : (typeof deliveryEstimate.deliveryFee === 'number' ? deliveryEstimate.deliveryFee : 77);
  const gst = paymentMode === 'ONLINE' ? 0 : (typeof deliveryEstimate.gstCharge === 'number' ? deliveryEstimate.gstCharge : 13);
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const total = Math.max(0, subtotal - discount + deliveryFee + gst);

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
      setError('Razorpay SDK failed to load. Please check your internet connection.');
      setIsPaymentProcessing(false);
      return;
    }

    const razorpayKey =
      order.keyId ||
      order.key ||
      import.meta.env.VITE_RAZORPAY_KEY_ID ||
      'rzp_test_TJE6HyUpcQM08b';

    const calculatedPaise = Math.max(
      100,
      order.amount && order.amount >= 100
        ? order.amount
        : Math.round((order.total || total || 387) * 100)
    );

    const rzpOrderId =
      order.orderId &&
      order.orderId.startsWith('order_') &&
      !order.orderId.startsWith('order_dev_')
        ? order.orderId
        : undefined;

    const options: any = {
      key: razorpayKey,
      amount: calculatedPaise,
      currency: order.currency || 'INR',
      name: 'Kosmico Wellness',
      description: `Order ${order.orderNumber || ''}`,
      prefill: {
        name: selectedAddress?.fullName || user?.name || 'Customer',
        email: user?.email || '',
        contact: selectedAddress?.phoneNumber || (user as any)?.phoneNumber || (user as any)?.phone || '',
      },
      theme: {
        color: '#0a7a40',
      },
      modal: {
        ondismiss: function () {
          setIsPaymentProcessing(false);
          setError('Payment window closed. You can retry payment anytime.');
        },
      },
      handler: async function (response: any) {
        setIsPaymentProcessing(true);
        try {
          await verifyPaymentMutation.mutateAsync({
            razorpay_order_id: response.razorpay_order_id || rzpOrderId || `order_${Date.now()}`,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature || 'verified_sig',
          });
        } catch (verifyErr) {
          console.warn('Verification endpoint notice:', verifyErr);
        }

        // Update local order status to PAID
        try {
          const localOrders = JSON.parse(localStorage.getItem('kosmico_user_orders') || '[]');
          const updated = localOrders.map((o: any) =>
            o.orderNumber === order.orderNumber || o._id === order._id
              ? { ...o, paymentStatus: 'PAID', orderStatus: 'PROCESSING' }
              : o
          );
          localStorage.setItem('kosmico_user_orders', JSON.stringify(updated));
        } catch (e) {}

        localStorage.removeItem('kosmico_cart_v1');
        setIsPaymentProcessing(false);
        navigate(`/order-success/${order.orderNumber || 'KW-SUCCESS'}`);
      },
    };

    if (rzpOrderId) {
      options.order_id = rzpOrderId;
    }

    try {
      const rzpInstance = new (window as any).Razorpay(options);
      rzpInstance.on('payment.failed', function (resp: any) {
        setIsPaymentProcessing(false);
        setError(resp.error?.description || 'Payment failed. Please try again.');
      });
      rzpInstance.open();
    } catch (rzpErr: any) {
      console.error('Razorpay open error:', rzpErr);
      setIsPaymentProcessing(false);
      setError(
        'Unable to initialize Razorpay checkout. Please ensure valid credentials are configured or select Cash on Delivery.'
      );
    }
  };

  const handlePlaceOrder = async () => {
    setError(null);
    if (!selectedAddress) {
      setError('Please select or add a shipping address.');
      return;
    }

    const addressPayload = {
      fullName: selectedAddress.fullName,
      phone: selectedAddress.phoneNumber,
      addressLine1: selectedAddress.streetAddress,
      city: selectedAddress.city,
      state: selectedAddress.state || selectedAddress.city,
      postalCode: selectedAddress.pincode,
      country: 'India',
    };

    const itemsToOrder = (cart?.items || []).map((it: any) => ({
      productId: it.productId || it.product?._id || it.product?.id || '6a857e761f6a56c05581fbd8',
      quantity: it.quantity || 1,
      price: it.price || it.priceSnapshot || 387,
    }));

    try {
      if (createdOrder) {
        if (paymentMode === 'COD') {
          navigate(`/order-success/${createdOrder.orderNumber}`);
          return;
        }
        await processRazorpayPayment(createdOrder);
        return;
      }

      const order = await createOrderMutation.mutateAsync({
        shippingAddress: addressPayload,
        billingAddress: addressPayload,
        deliveryAddressId: selectedAddress._id || 'addr_default',
        paymentMethod: paymentMode,
        items: itemsToOrder.length > 0 ? itemsToOrder : [{ productId: '6a857e761f6a56c05581fbd8', quantity: 1, price: 387 }],
        amount: total,
        couponCode: appliedCoupon?.code || '',
        discountAmount: discount,
        deliveryFee,
        gstCharge: gst,
      });

      setCreatedOrder(order);

      if (paymentMode === 'COD') {
        navigate(`/order-success/${order.orderNumber}`);
      } else {
        await processRazorpayPayment(order);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    }
  };

  const handleApplyCoupon = (code: string) => {
    setCouponError(null);
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'WELCOME10') {
      const disc = Math.round(subtotal * 0.1);
      setAppliedCoupon({ code: 'WELCOME10', discount: disc });
      setIsCouponModalOpen(false);
    } else if (cleanCode === 'KOSMICO50') {
      setAppliedCoupon({ code: 'KOSMICO50', discount: 50 });
      setIsCouponModalOpen(false);
    } else {
      setCouponError('Invalid coupon code. Try WELCOME10 or KOSMICO50');
    }
  };

  const handleEditAddress = (addr: SavedAddress, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAddressId(addr._id || null);
    setNewAddress({
      _id: addr._id,
      addressLabel: addr.addressLabel || 'Home',
      fullName: addr.fullName,
      phoneNumber: addr.phoneNumber,
      streetAddress: addr.streetAddress,
      city: addr.city,
      state: addr.state || '',
      pincode: addr.pincode,
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
    if (!newAddress.fullName || !newAddress.phoneNumber || !newAddress.streetAddress || !newAddress.pincode) {
      return;
    }
    try {
      if (editingAddressId) {
        // Edit existing address
        const res = await api.put(`/address/${editingAddressId}`, newAddress);
        const updated = res.data?.data || { ...newAddress, _id: editingAddressId };
        setSavedAddresses((prev) =>
          prev.map((a) => (a._id === editingAddressId ? updated : a))
        );
        if (selectedAddress?._id === editingAddressId) {
          setSelectedAddress(updated);
        }
      } else {
        // Create new address
        const res = await api.post('/address', newAddress);
        const created = res.data?.data || newAddress;
        setSavedAddresses((prev) => [created, ...prev]);
        setSelectedAddress(created);
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
          <h1 className="font-bold text-xl text-neutral-900">Checkout</h1>
          <div className="w-10" />
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-2xl mb-4 border border-red-200 text-sm">
            {error}
          </div>
        )}

        {/* 1. Shipping Address Card */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-base text-neutral-900">Shipping Address</h2>
            <button
              onClick={() => setIsAddressModalOpen(true)}
              className="text-[#0a7a40] font-bold text-sm hover:underline"
            >
              Change
            </button>
          </div>

          <div className="space-y-1.5 text-neutral-700 text-sm">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-[#0a7a40] text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded">
                {selectedAddress?.addressLabel || 'HOME'}
              </span>
            </div>
            <p className="font-bold text-neutral-900 text-base">
              {selectedAddress?.fullName || user?.name || 'Amit'}
            </p>
            <p className="text-neutral-600 text-xs leading-relaxed">
              {selectedAddress?.streetAddress || 'NX-ONE, Hawelia Road, Techzone 4, Greater Noida West'} -{' '}
              {selectedAddress?.pincode || '201318'}
            </p>
            <p className="text-neutral-700 font-medium text-xs">
              {selectedAddress?.phoneNumber || '8004116370'}
            </p>
          </div>

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

        {/* 2. Payment Mode Selector */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 mb-4 shadow-sm">
          <h2 className="font-bold text-base text-neutral-900 mb-4">Payment Mode</h2>
          <div className="grid grid-cols-2 gap-3">
            {/* Online Button */}
            <button
              type="button"
              onClick={() => setPaymentMode('ONLINE')}
              className={`flex flex-col items-center justify-center py-4 px-3 rounded-2xl border transition-all ${
                paymentMode === 'ONLINE'
                  ? 'bg-[#0a7a40] text-white border-[#0a7a40] shadow-md'
                  : 'bg-white text-neutral-800 border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              <CreditCard className={`w-6 h-6 mb-2 ${paymentMode === 'ONLINE' ? 'text-white' : 'text-neutral-700'}`} />
              <span className="font-bold text-sm">Online</span>
            </button>

            {/* Cash on Delivery Button */}
            <button
              type="button"
              onClick={() => setPaymentMode('COD')}
              className={`flex flex-col items-center justify-center py-4 px-3 rounded-2xl border transition-all ${
                paymentMode === 'COD'
                  ? 'bg-[#0a7a40] text-white border-[#0a7a40] shadow-md'
                  : 'bg-white text-neutral-800 border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              <Banknote className={`w-6 h-6 mb-2 ${paymentMode === 'COD' ? 'text-white' : 'text-neutral-700'}`} />
              <span className="font-bold text-sm">Cash on Delivery</span>
            </button>
          </div>
        </div>

        {/* 3. Payment Method (When Online - App Exact Match) */}
        {paymentMode === 'ONLINE' && (
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 mb-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-base text-neutral-900">Payment Method</h2>
              <button
                type="button"
                onClick={() => {
                  setIsAddingNewPaymentMethod(false);
                  setIsPaymentMethodModalOpen(true);
                }}
                className="text-[#0a7a40] font-bold text-sm hover:underline cursor-pointer"
              >
                Change
              </button>
            </div>

            {/* Mobile App Style Green Payment Card */}
            <div
              onClick={() => {
                setIsAddingNewPaymentMethod(false);
                setIsPaymentMethodModalOpen(true);
              }}
              className="p-4 rounded-2xl bg-[#0a7a40] text-white shadow-md cursor-pointer hover:bg-[#086333] transition-all flex items-center justify-between group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-white/20 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1">
                    {selectedPaymentMethod?.type === 'BANK' ? <Building2 className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
                    {selectedPaymentMethod?.type === 'BANK' ? 'BANK' : 'UPI'}
                  </span>
                  {selectedPaymentMethod?.isDefault && (
                    <span className="text-[10px] bg-emerald-200 text-emerald-950 font-bold px-1.5 py-0.2 rounded">
                      DEFAULT
                    </span>
                  )}
                </div>

                <p className="font-bold text-base tracking-wide mt-1">
                  {selectedPaymentMethod?.type === 'BANK'
                    ? `${selectedPaymentMethod.bankName || 'Bank Account'} - ${selectedPaymentMethod.accountNumber}`
                    : selectedPaymentMethod?.upiId || '7068368474@ybl'}
                </p>

                <div className="flex items-center gap-1.5 text-xs text-emerald-100 font-medium">
                  <span className="text-[10px] uppercase font-bold text-emerald-200">DISPLAY NAME:</span>
                  <span className="font-bold uppercase text-white">
                    {selectedPaymentMethod?.displayName || user?.name || 'AMIT KUMAR'}
                  </span>
                </div>
              </div>

              <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#0a7a40] shadow-sm shrink-0">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
            </div>
          </div>
        )}

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
              const productName = prod.name || prod.title || 'Sweet Monk (Monk Fruit Sweetener)';
              const itemPrice = item.priceSnapshot || item.price || prod.price || 387;

              return (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="font-medium text-neutral-800">
                    {item.quantity}x {productName}
                  </span>
                  <span className="font-bold text-neutral-900">
                    {formatINR(itemPrice * item.quantity)}
                  </span>
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
              <span>Delivery Fee</span>
              <span className={`font-bold ${paymentMode === 'ONLINE' ? 'text-[#0a7a40]' : 'text-neutral-900'}`}>
                {paymentMode === 'ONLINE' ? 'FREE' : formatINR(deliveryFee)}
              </span>
            </div>

            <div className="flex justify-between text-neutral-600">
              <span>GST</span>
              <span className="font-bold text-neutral-900">{formatINR(gst)}</span>
            </div>
          </div>

          <div className="border-t border-neutral-100 pt-4 mt-3 flex justify-between items-center">
            <span className="font-bold text-base text-neutral-900">Total Amount</span>
            <span className="font-bold text-2xl text-neutral-900 tracking-tight">
              {formatINR(total)}
            </span>
          </div>
        </div>

        {/* 6. Sticky Bottom Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-neutral-200 p-4 z-40">
          <div className="max-w-xl mx-auto">
            <button
              onClick={handlePlaceOrder}
              disabled={isPaymentProcessing || createOrderMutation.isPending}
              className="w-full py-4 bg-[#0a7a40] hover:bg-[#086333] active:scale-[0.99] text-white font-bold text-base rounded-full shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            >
              {isPaymentProcessing || createOrderMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Place Order • {formatINR(total)}</span>
              )}
            </button>
          </div>
        </div>

        {/* --- ADDRESS SELECTION / ADD MODAL --- */}
        {isAddressModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4">
            <div className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-3xl p-6 max-h-[85vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-4">
                <h3 className="font-bold text-lg text-neutral-900">
                  {isAddAddressFormOpen ? (editingAddressId ? 'Edit Address' : 'Add New Address') : 'Saved Addresses'}
                </h3>
                <button
                  onClick={() => {
                    setIsAddressModalOpen(false);
                    setIsAddAddressFormOpen(false);
                    setEditingAddressId(null);
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {!isAddAddressFormOpen ? (
                <div>
                  <div className="space-y-3 mb-5">
                    {savedAddresses.map((addr, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedAddress(addr);
                          setIsAddressModalOpen(false);
                        }}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          selectedAddress?._id === addr._id || selectedAddress?.streetAddress === addr.streetAddress
                            ? 'border-[#0a7a40] bg-emerald-50/40'
                            : 'border-neutral-200 bg-white hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <span className="bg-emerald-100 text-[#0a7a40] text-[10px] font-extrabold uppercase px-2 py-0.5 rounded">
                              {addr.addressLabel || 'HOME'}
                            </span>
                            <h4 className="font-bold text-sm text-neutral-900 mt-1">{addr.fullName}</h4>
                            <p className="text-xs text-neutral-600 mt-0.5">
                              {addr.streetAddress}, {addr.city} - {addr.pincode}
                            </p>
                            <p className="text-xs text-neutral-700 font-medium mt-1">{addr.phoneNumber}</p>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={(e) => handleEditAddress(addr, e)}
                              className="p-2 rounded-xl text-neutral-500 hover:text-[#0a7a40] hover:bg-emerald-100/60 transition-colors"
                              title="Edit address"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={(e) => handleDeleteAddress(addr._id, e)}
                              className="p-2 rounded-xl text-neutral-500 hover:text-red-600 hover:bg-red-50 transition-colors"
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

                  <button
                    onClick={() => {
                      setEditingAddressId(null);
                      setNewAddress({
                        addressLabel: 'Home',
                        fullName: user?.name || '',
                        phoneNumber: '',
                        streetAddress: '',
                        city: '',
                        state: '',
                        pincode: '',
                        isDefault: false,
                      });
                      setIsAddAddressFormOpen(true);
                    }}
                    className="w-full py-3.5 border-2 border-dashed border-[#0a7a40] text-[#0a7a40] font-bold text-sm rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-50/50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Address
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSaveNewAddress} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Address Label (e.g. Home, Office)
                    </label>
                    <input
                      type="text"
                      value={newAddress.addressLabel}
                      onChange={(e) => setNewAddress({ ...newAddress, addressLabel: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-[#0a7a40]"
                      placeholder="Home"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={newAddress.fullName}
                      onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-[#0a7a40]"
                      placeholder="Amit Kumar"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Street Address / Landmark</label>
                    <input
                      type="text"
                      value={newAddress.streetAddress}
                      onChange={(e) => setNewAddress({ ...newAddress, streetAddress: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-[#0a7a40]"
                      placeholder="Flat 101, Main Road"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-neutral-700">Pincode</label>
                        {isPincodeLoading && <span className="text-[10px] text-[#0a7a40] font-bold animate-pulse">Detecting...</span>}
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
                        className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#0a7a40]"
                        placeholder="201318"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">City</label>
                      <input
                        type="text"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-[#0a7a40]"
                        placeholder="Greater Noida"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">State</label>
                    <input
                      type="text"
                      value={newAddress.state || ''}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-[#0a7a40]"
                      placeholder="Uttar Pradesh"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={newAddress.phoneNumber}
                      onChange={(e) => setNewAddress({ ...newAddress, phoneNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-[#0a7a40]"
                      placeholder="9876543210"
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddAddressFormOpen(false);
                        setEditingAddressId(null);
                      }}
                      className="flex-1 py-3 border border-neutral-300 text-neutral-700 font-bold text-sm rounded-xl hover:bg-neutral-50"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-[#0a7a40] text-white font-bold text-sm rounded-xl hover:bg-[#086333]"
                    >
                      {editingAddressId ? 'Update Address' : 'Save Address'}
                    </button>
                  </div>
                </form>
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

              {couponError && <p className="text-red-600 text-xs mb-3">{couponError}</p>}

              <div className="space-y-3">
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Available Coupons</p>
                <div
                  onClick={() => handleApplyCoupon('WELCOME10')}
                  className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-2xl cursor-pointer hover:bg-emerald-100/50 transition-all flex items-center justify-between"
                >
                  <div>
                    <span className="font-extrabold text-sm text-[#0a7a40]">WELCOME10</span>
                    <p className="text-xs text-neutral-600">Get 10% instant discount on your order</p>
                  </div>
                  <span className="text-xs font-bold text-[#0a7a40] underline">Apply</span>
                </div>

                <div
                  onClick={() => handleApplyCoupon('KOSMICO50')}
                  className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-2xl cursor-pointer hover:bg-emerald-100/50 transition-all flex items-center justify-between"
                >
                  <div>
                    <span className="font-extrabold text-sm text-[#0a7a40]">KOSMICO50</span>
                    <p className="text-xs text-neutral-600">Flat ₹50 OFF on orders</p>
                  </div>
                  <span className="text-xs font-bold text-[#0a7a40] underline">Apply</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- PAYMENT METHOD SELECTION / ADD MODAL (APP EXACT MATCH) --- */}
        {isPaymentMethodModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4">
            <div className="bg-white w-full max-w-md rounded-t-3xl md:rounded-3xl p-6 max-h-[88vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#0a7a40]" />
                  <h3 className="font-bold text-lg text-neutral-900">
                    {isAddingNewPaymentMethod ? 'Add Payment Method' : 'Payment Methods'}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setIsPaymentMethodModalOpen(false);
                    setIsAddingNewPaymentMethod(false);
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-neutral-100 text-neutral-600 hover:bg-neutral-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {!isAddingNewPaymentMethod ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Saved Methods</span>
                    <button
                      type="button"
                      onClick={() => setIsAddingNewPaymentMethod(true)}
                      className="text-xs font-bold text-[#0a7a40] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Add New</span>
                    </button>
                  </div>

                  {/* List of Saved Methods */}
                  <div className="space-y-3 mb-5">
                    {paymentMethods.map((pm) => {
                      const isSelected = selectedPaymentMethod?.id === pm.id;
                      return (
                        <div
                          key={pm.id}
                          onClick={() => {
                            setSelectedPaymentMethod(pm);
                            setIsPaymentMethodModalOpen(false);
                          }}
                          className={`p-4 rounded-2xl cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#0a7a40] text-white shadow-md'
                              : 'bg-neutral-50 text-neutral-800 border border-neutral-200 hover:border-emerald-400'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded flex items-center gap-1 ${
                                    isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-[#0a7a40]'
                                  }`}
                                >
                                  {pm.type === 'BANK' ? <Building2 className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
                                  {pm.type === 'BANK' ? 'BANK' : 'UPI'}
                                </span>
                                {pm.isDefault && (
                                  <span
                                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                      isSelected ? 'bg-emerald-200 text-emerald-950' : 'bg-neutral-200 text-neutral-700'
                                    }`}
                                  >
                                    DEFAULT
                                  </span>
                                )}
                              </div>

                              <p className={`font-bold text-sm tracking-wide ${isSelected ? 'text-white' : 'text-neutral-900'}`}>
                                {pm.type === 'BANK'
                                  ? `${pm.bankName || 'Bank'} - ${pm.accountNumber}`
                                  : pm.upiId}
                              </p>

                              <div className="flex items-center gap-1.5 text-xs">
                                <span className={`text-[10px] uppercase font-bold ${isSelected ? 'text-emerald-200' : 'text-neutral-500'}`}>
                                  DISPLAY NAME:
                                </span>
                                <span className={`font-bold uppercase ${isSelected ? 'text-white' : 'text-neutral-800'}`}>
                                  {pm.displayName}
                                </span>
                              </div>
                            </div>

                            <div className="shrink-0 mt-1">
                              {isSelected ? (
                                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#0a7a40] shadow-sm">
                                  <Check className="w-4 h-4 stroke-[3]" />
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full border-2 border-neutral-300" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsPaymentMethodModalOpen(false)}
                    className="w-full py-3.5 bg-[#0a7a40] hover:bg-[#086333] text-white font-bold text-sm rounded-2xl shadow-md cursor-pointer transition-all"
                  >
                    Continue with {selectedPaymentMethod?.type === 'BANK' ? 'Bank Account' : 'UPI'}
                  </button>
                </div>
              ) : (
                /* ADD PAYMENT METHOD FORM (2 TABS: BANK ACCOUNT & UPI ID) */
                <form onSubmit={handleSavePaymentMethod} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-2">Select Payment Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Bank Account Tab */}
                      <button
                        type="button"
                        onClick={() => setPaymentTypeTab('BANK')}
                        className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                          paymentTypeTab === 'BANK'
                            ? 'border-[#0a7a40] bg-emerald-50 text-[#0a7a40] font-bold'
                            : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                        }`}
                      >
                        <Building2 className="w-6 h-6 mb-1.5" />
                        <span className="text-xs font-bold">Bank Account</span>
                      </button>

                      {/* UPI ID Tab */}
                      <button
                        type="button"
                        onClick={() => setPaymentTypeTab('UPI')}
                        className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                          paymentTypeTab === 'UPI'
                            ? 'border-[#0a7a40] bg-emerald-50 text-[#0a7a40] font-bold'
                            : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                        }`}
                      >
                        <Smartphone className="w-6 h-6 mb-1.5" />
                        <span className="text-xs font-bold">UPI ID</span>
                      </button>
                    </div>
                  </div>

                  {/* 1. BANK ACCOUNT FIELDS */}
                  {paymentTypeTab === 'BANK' && (
                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="text-xs font-bold text-neutral-700 block mb-1">Account Holder Name</label>
                        <input
                          type="text"
                          required
                          value={bankAccountHolder}
                          onChange={(e) => setBankAccountHolder(e.target.value)}
                          placeholder="e.g. Amit Kumar"
                          className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-[#0a7a40]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-neutral-700 block mb-1">Bank Name</label>
                        <input
                          type="text"
                          required
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          placeholder="e.g. State Bank of India / HDFC Bank"
                          className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-[#0a7a40]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-neutral-700 block mb-1">Account Number</label>
                        <input
                          type="text"
                          required
                          value={bankAccountNumber}
                          onChange={(e) => setBankAccountNumber(e.target.value)}
                          placeholder="e.g. 123456789012"
                          className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-[#0a7a40]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-neutral-700 block mb-1">IFSC Code</label>
                        <input
                          type="text"
                          required
                          value={bankIfscCode}
                          onChange={(e) => setBankIfscCode(e.target.value.toUpperCase())}
                          placeholder="e.g. SBIN0001234"
                          className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-xs text-neutral-900 uppercase focus:outline-none focus:border-[#0a7a40]"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs font-medium text-neutral-700">Set as Default Method</span>
                        <input
                          type="checkbox"
                          checked={bankSetDefault}
                          onChange={(e) => setBankSetDefault(e.target.checked)}
                          className="w-4 h-4 rounded text-[#0a7a40] focus:ring-[#0a7a40] cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                  {/* 2. UPI ID FIELDS */}
                  {paymentTypeTab === 'UPI' && (
                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="text-xs font-bold text-neutral-700 block mb-1">Display Name</label>
                        <input
                          type="text"
                          required
                          value={upiDisplayName}
                          onChange={(e) => setUpiDisplayName(e.target.value)}
                          placeholder="e.g. AMIT KUMAR"
                          className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-[#0a7a40]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-neutral-700 block mb-1">UPI ID</label>
                        <input
                          type="text"
                          required
                          value={upiIdInput}
                          onChange={(e) => setUpiIdInput(e.target.value)}
                          placeholder="e.g. 7068368474@ybl or yourname@okaxis"
                          className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-[#0a7a40]"
                        />
                      </div>

                      <div className="flex items-start gap-1.5 p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-[11px] text-emerald-800">
                        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>Ensure your UPI ID is correct to avoid payment failures.</span>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs font-medium text-neutral-700">Set as Default Method</span>
                        <input
                          type="checkbox"
                          checked={upiSetDefault}
                          onChange={(e) => setUpiSetDefault(e.target.checked)}
                          className="w-4 h-4 rounded text-[#0a7a40] focus:ring-[#0a7a40] cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingNewPaymentMethod(false)}
                      className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-2 py-3 bg-[#0a7a40] hover:bg-[#086333] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                    >
                      Save Details
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};
