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
  Smartphone,
  Building2,
  Info
} from 'lucide-react';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { useCart } from '../hooks/useCart';
import { useCreateOrder } from '../hooks/useOrders';
import { useVerifyPayment, useCreateCodUpfront, useVerifyCodUpfront, useCreateRazorpayOrder } from '../hooks/usePayments';
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

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { data: cart, isLoading: isCartLoading } = useCart();
  const createOrderMutation = useCreateOrder();
  const createRazorpayOrderMutation = useCreateRazorpayOrder();
  const verifyPaymentMutation = useVerifyPayment();
  const createCodUpfrontMutation = useCreateCodUpfront();
  const verifyCodUpfrontMutation = useVerifyCodUpfront();
  const { user } = useAuthStore();

  // Selected payment mode: 'ONLINE' or 'COD'
  const [paymentMode, setPaymentMode] = useState<'ONLINE' | 'COD'>('ONLINE');
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  // Online Payment Method state (UPI & Bank Account - dynamic strictly for this authenticated user)
  const [paymentMethods, setPaymentMethods] = useState<SavedPaymentMethod[]>(() => {
    const userMethods = (user as any)?.savedPaymentMethods;
    if (Array.isArray(userMethods) && userMethods.length > 0) {
      return userMethods.map((m: any) => ({
        id: m._id || m.id,
        type: m.type || 'UPI',
        displayName: m.displayName || user?.name || 'User',
        upiId: m.upiId,
        bankName: m.bankName,
        accountNumber: m.accountNumber,
        ifscCode: m.ifscCode,
        isDefault: !!m.isDefault,
      }));
    }
    return [];
  });

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<SavedPaymentMethod | undefined>(() => {
    return paymentMethods.find((m) => m.isDefault) || paymentMethods[0];
  });

  const [isPaymentMethodModalOpen, setIsPaymentMethodModalOpen] = useState(false);
  const [isAddingNewPaymentMethod, setIsAddingNewPaymentMethod] = useState(false);
  const [paymentTypeTab, setPaymentTypeTab] = useState<'BANK' | 'UPI'>('UPI');

  // Form states for Add Payment Method
  const [bankAccountHolder, setBankAccountHolder] = useState(user?.name || '');
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIfscCode, setBankIfscCode] = useState('');
  const [bankSetDefault, setBankSetDefault] = useState(true);

  const [upiDisplayName, setUpiDisplayName] = useState(user?.name || '');
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
        displayName: (upiDisplayName || user?.name || 'User').toUpperCase(),
        upiId: upiIdInput.trim(),
        isDefault: upiSetDefault,
      };
      const updatedList = upiSetDefault
        ? [newMethod, ...paymentMethods.map((m) => ({ ...m, isDefault: false }))]
        : [...paymentMethods, newMethod];
      setPaymentMethods(updatedList);
      setSelectedPaymentMethod(newMethod);
      localStorage.setItem('kosmico_saved_payment_methods', JSON.stringify(updatedList));
      setIsAddingNewPaymentMethod(false);
      setUpiIdInput('');
    } else {
      if (!bankAccountNumber.trim() || !bankIfscCode.trim()) return;
      const newMethod: SavedPaymentMethod = {
        id: `pm-${Date.now()}`,
        type: 'BANK',
        displayName: (bankAccountHolder || user?.name || 'User').toUpperCase(),
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
    (sum: number, item: any) => sum + (item.priceSnapshot || item.price || 387) * item.quantity,
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
            You don't have any items in your cart. Add 100% natural Sweet Monk Sweetener to continue!
          </p>
          <Link to="/shop">
            <Button className="w-full py-3 bg-[#0a7a40] hover:bg-[#086333] text-white font-bold text-sm rounded-xl shadow-md">
              Browse Sweet Monk Products (₹387)
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
          toast.error('Payment window closed. You can retry payment anytime.');
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
        } catch (e) { }

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
        toast.error(resp.error?.description || 'Payment failed. Please try again.');
      });
      rzpInstance.open();
    } catch (rzpErr: any) {
      console.error('Razorpay open error:', rzpErr);
      setIsPaymentProcessing(false);
      toast.error(
        'Unable to initialize Razorpay checkout. Please ensure valid credentials are configured or select Cash on Delivery.'
      );
    }
  };

  const processRazorpayCodAdvance = async (order: any, advanceAmount: number) => {
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

    const calculatedPaise = Math.max(100, Math.round(advanceAmount * 100));

    const rzpOrderId =
      order.orderId && order.orderId.startsWith('order_') && !order.orderId.startsWith('order_dev_')
        ? order.orderId
        : undefined;

    const options: any = {
      key: razorpayKey,
      amount: calculatedPaise,
      currency: order.currency || 'INR',
      name: 'Kosmico Wellness',
      description: `Advance for Order ${order.orderNumber || ''}`,
      prefill: {
        name: selectedAddress?.fullName || user?.name || 'Customer',
        email: user?.email || '',
        contact: selectedAddress?.phoneNumber || (user as any)?.phoneNumber || (user as any)?.phone || '',
      },
      theme: { color: '#0a7a40' },
      modal: {
        ondismiss: function () {
          setIsPaymentProcessing(false);
          toast.error('Payment window closed. Your order was not placed.');
        },
      },
      handler: async function (response: any) {
        setIsPaymentProcessing(true);
        try {
          await verifyCodUpfrontMutation.mutateAsync({
            razorpay_order_id: response.razorpay_order_id || rzpOrderId || `order_${Date.now()}`,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature || 'verified_sig',
          });
        } catch (verifyErr) {
          console.warn('COD Advance Verification notice:', verifyErr);
        }

        localStorage.removeItem('kosmico_cart_v1');
        setIsPaymentProcessing(false);
        navigate(`/order-success/${order.orderNumber || 'KW-SUCCESS'}`);
      },
    };

    if (rzpOrderId) options.order_id = rzpOrderId;

    try {
      const rzpInstance = new (window as any).Razorpay(options);
      rzpInstance.on('payment.failed', function (resp: any) {
        setIsPaymentProcessing(false);
        toast.error(resp.error?.description || 'Payment failed. Please try again.');
      });
      rzpInstance.open();
    } catch (rzpErr: any) {
      console.error('Razorpay open error:', rzpErr);
      setIsPaymentProcessing(false);
      toast.error('Unable to initialize Razorpay checkout for COD advance.');
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
      return {
        productId: String(pId || '').trim(),
        product: String(pId || '').trim(),
        quantity: Number(it.quantity) || 1,
        qty: Number(it.quantity) || 1,
        price: Number(it.price || it.priceSnapshot || it.product?.discountPrice || it.product?.price || 387),
        name: it.product?.title || it.product?.name || it.name || 'Kosmico Product',
        image: (it.product?.images && it.product?.images[0]?.url) || it.product?.image || it.image || '',
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
        deliveryAddressId: selectedAddress._id!,
        items: itemsToOrder,
        couponCode: appliedCoupon?.code || undefined,
        discountAmount: discount,
        deliveryFee,
        gstCharge: gst,
      };

      if (paymentMode === 'COD') {
        const advanceAmount = deliveryFee + gst;

        const codPayload = {
          ...payload,
          deliveryAddress: selectedAddress._id,
          upfrontAmount: advanceAmount,
          items: itemsToOrder,
        };

        const order = await createCodUpfrontMutation.mutateAsync(codPayload);
        setCreatedOrder(order);
        await processRazorpayCodAdvance(order, advanceAmount);
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

  const { data: dbCoupons } = useCoupons();

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

    const addressPayload = {
      addressLabel: newAddress.addressLabel,
      fullName: newAddress.fullName,
      streetAddress: newAddress.streetAddress,
      city: newAddress.city,
      pincode: newAddress.pincode,
      phoneNumber: newAddress.phoneNumber
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
      } else {
        // Create new address
        const res = await api.post('/address', addressPayload);
        const created = res.data?.data || { ...addressPayload, isDefault: newAddress.isDefault };
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
                <span className="bg-emerald-100 text-[#0a7a40] text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded">
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
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 mb-4 shadow-sm">
          <h2 className="font-bold text-base text-neutral-900 mb-3">Payment Mode</h2>

          <div className="space-y-3">
            {/* 1. Online Payment Card */}
            <div
              onClick={() => setPaymentMode('ONLINE')}
              className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${paymentMode === 'ONLINE'
                  ? 'border-[#0a7a40] bg-emerald-50/20 shadow-xs'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
                }`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${paymentMode === 'ONLINE' ? 'bg-[#0a7a40] text-white' : 'bg-neutral-100 text-neutral-700'
                  }`}>
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-neutral-900">Online Payment</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">Pay full amount securely via UPI, Cards, NetBanking</p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMode === 'ONLINE' ? 'border-[#0a7a40] bg-[#0a7a40]' : 'border-neutral-300'
                }`}>
                {paymentMode === 'ONLINE' && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </div>

            {/* 2. Cash on Delivery Card (Terracotta / Brown Style) */}
            <div className="relative pt-1.5">
              {/* Floating Top-Right Green Badge */}
              {paymentMode === 'COD' && (
                <div className="absolute -top-1.5 right-4 z-10 bg-[#00a86b] text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-sm">
                  Pay ₹{deliveryFee + gst} now. Rest on delivery
                </div>
              )}

              <div
                onClick={() => setPaymentMode('COD')}
                className={`relative p-4 rounded-2xl transition-all cursor-pointer overflow-hidden ${paymentMode === 'COD'
                    ? 'bg-[#965726] text-white shadow-md border-2 border-[#965726]'
                    : 'border-2 border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${paymentMode === 'COD' ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-700'
                      }`}>
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`font-bold text-sm ${paymentMode === 'COD' ? 'text-white' : 'text-neutral-900'}`}>
                        Cash on Delivery
                      </h3>
                      <p className={`text-xs mt-0.5 ${paymentMode === 'COD' ? 'text-[#f3e8df]' : 'text-neutral-500'}`}>
                        Delivery + GST amount non-refundable
                      </p>
                    </div>
                  </div>

                  {paymentMode === 'COD' ? (
                    <div className="text-right pl-2 shrink-0">
                      <div className="text-lg font-black tracking-tight text-white font-sans">
                        ₹{deliveryFee + gst}
                      </div>
                      <div className="text-[10px] text-[#f3e8df] font-medium">
                        pay now
                      </div>
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-neutral-300 shrink-0" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Payment Method (When Online) */}
        {paymentMode === 'ONLINE' && (
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 mb-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-base text-neutral-900">Payment Method</h2>
              {paymentMethods.length > 0 && (
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
              )}
            </div>

            {selectedPaymentMethod ? (
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
                      {selectedPaymentMethod.type === 'BANK' ? <Building2 className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
                      {selectedPaymentMethod.type === 'BANK' ? 'BANK' : 'UPI'}
                    </span>
                    {selectedPaymentMethod.isDefault && (
                      <span className="text-[10px] bg-emerald-200 text-emerald-950 font-bold px-1.5 py-0.2 rounded">
                        DEFAULT
                      </span>
                    )}
                  </div>

                  <p className="font-bold text-base tracking-wide mt-1">
                    {selectedPaymentMethod.type === 'BANK'
                      ? `${selectedPaymentMethod.bankName || 'Bank Account'} - ${selectedPaymentMethod.accountNumber}`
                      : selectedPaymentMethod.upiId}
                  </p>

                  <div className="flex items-center gap-1.5 text-xs text-emerald-100 font-medium">
                    <span className="text-[10px] uppercase font-bold text-emerald-200">DISPLAY NAME:</span>
                    <span className="font-bold uppercase text-white">
                      {selectedPaymentMethod.displayName || user?.name || 'User'}
                    </span>
                  </div>
                </div>

                <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#0a7a40] shadow-sm shrink-0">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#0a7a40] text-white shadow-md flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-white/20 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded backdrop-blur-xs">
                      Razorpay Gateway
                    </span>
                    <span className="text-[10px] bg-emerald-200 text-emerald-950 font-bold px-1.5 py-0.2 rounded">
                      SECURE
                    </span>
                  </div>
                  <p className="font-bold text-sm tracking-wide mt-0.5">
                    UPI, Cards, NetBanking &amp; Wallets
                  </p>
                  <p className="text-xs text-emerald-100">
                    Pay securely using Google Pay, PhonePe, Paytm, Cards or NetBanking
                  </p>
                </div>
                <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#0a7a40] shadow-sm shrink-0">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              </div>
            )}
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
              const productName = prod.name || prod.title || 'Sweet Monk (250ml)';
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
              disabled={isPaymentProcessing || createOrderMutation.isPending || createRazorpayOrderMutation.isPending || createCodUpfrontMutation.isPending}
              className="w-full py-4 bg-[#0a7a40] hover:bg-[#086333] active:scale-[0.99] text-white font-bold text-base rounded-full shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            >
              {isPaymentProcessing || createOrderMutation.isPending || createRazorpayOrderMutation.isPending || createCodUpfrontMutation.isPending ? (
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
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedAddress?._id === addr._id || selectedAddress?.streetAddress === addr.streetAddress
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
                  {/* Address Label */}
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

                  {/* Full Name */}
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

                  {/* Street Address */}
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

                  {/* City | Pincode */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">City</label>
                      <input
                        type="text"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-[#0a7a40]"
                        placeholder="Noida"
                        required
                      />
                    </div>
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
                  </div>

                  {/* Phone Number */}
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

                  {/* Set as Default Address (Toggle) */}
                  <div className="flex items-center justify-between pt-2 pb-1">
                    <label className="text-sm font-semibold text-neutral-700 cursor-pointer" htmlFor="isDefaultCheck">
                      Set as Default Address
                    </label>
                    <div
                      className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${newAddress.isDefault ? 'bg-[#0a7a40]' : 'bg-neutral-300'}`}
                      onClick={() => setNewAddress({ ...newAddress, isDefault: !newAddress.isDefault })}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${newAddress.isDefault ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3.5 bg-[#0a7a40] text-white font-bold text-sm rounded-xl hover:bg-[#086333]"
                    >
                      {editingAddressId ? 'Update Address' : 'Save Address'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddAddressFormOpen(false);
                        setEditingAddressId(null);
                      }}
                      className="w-full mt-2 py-3 text-neutral-600 font-bold text-sm hover:text-neutral-900 text-center"
                    >
                      Cancel
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
                          className={`p-4 rounded-2xl cursor-pointer transition-all ${isSelected
                              ? 'bg-[#0a7a40] text-white shadow-md'
                              : 'bg-neutral-50 text-neutral-800 border border-neutral-200 hover:border-emerald-400'
                            }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded flex items-center gap-1 ${isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-[#0a7a40]'
                                    }`}
                                >
                                  {pm.type === 'BANK' ? <Building2 className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
                                  {pm.type === 'BANK' ? 'BANK' : 'UPI'}
                                </span>
                                {pm.isDefault && (
                                  <span
                                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${isSelected ? 'bg-emerald-200 text-emerald-950' : 'bg-neutral-200 text-neutral-700'
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
                        className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${paymentTypeTab === 'BANK'
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
                        className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${paymentTypeTab === 'UPI'
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
