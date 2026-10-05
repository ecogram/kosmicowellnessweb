const axios = require('axios');

class ShiprocketService {
  constructor() {
    this.token = null;
    this.tokenExpiry = null;
    this.baseUrl = 'https://apiv2.shiprocket.in/v1/external';
  }

  async getToken() {
    const now = Date.now();
    // Re-use token if valid for at least 1 more hour
    if (this.token && this.tokenExpiry && now < this.tokenExpiry - 3600000) {
      return this.token;
    }

    const email = process.env.SHIPROCKET_EMAIL || 'akshaykumar19262@gmail.com';
    const password = process.env.SHIPROCKET_PASSWORD || '@DpLgdQf9n^Dl6xHj1BtD0N4adb8YbW3';

    try {
      const response = await axios.post(`${this.baseUrl}/auth/login`, {
        email,
        password,
      });

      if (response.data && response.data.token) {
        this.token = response.data.token;
        // Shiprocket tokens are valid for 10 days; set expiry for 9 days
        this.tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000;
        return this.token;
      }
      throw new Error('Failed to obtain Shiprocket token');
    } catch (error) {
      console.error('Shiprocket login error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Fetches live courier serviceability, dynamic rates per pincode, and ETD from Shiprocket
   */
  async getServiceability(deliveryPincode, weight = 0.5, paymentMethod = 'ONLINE', subtotal = 0) {
    const cleanPincode = (deliveryPincode || '201318').toString().trim();
    const pickupPincode = (process.env.SHIPROCKET_PICKUP_PINCODE || '201306').toString().trim();
    const isOnline = (paymentMethod || '').toUpperCase() === 'ONLINE' || (paymentMethod || '').toUpperCase() === 'PREPAID';
    const isCod = isOnline ? 0 : 1;

    let bestCourier = null;
    let courierPartner = 'Shiprocket Express / Bluedart';
    let expectedDate = 'Sep 14, 2026';
    let estimatedDays = '2 - 3 Days';

    const calculatedWeight = Math.max(0.5, Number(weight) || 0.5);

    try {
      const token = await this.getToken();
      const response = await axios.get(`${this.baseUrl}/courier/serviceability/`, {
        params: {
          pickup_postcode: pickupPincode,
          delivery_postcode: cleanPincode,
          weight: calculatedWeight,
          cod: isCod,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const couriers = response.data?.data?.available_courier_companies || [];
      if (couriers.length > 0) {
        bestCourier = couriers.reduce((prev, curr) => (Number(prev.rate) < Number(curr.rate) ? prev : curr), couriers[0]);
        courierPartner = bestCourier.courier_name || courierPartner;
        expectedDate = bestCourier.etd || expectedDate;
        estimatedDays = bestCourier.estimated_delivery_days ? `${bestCourier.estimated_delivery_days} Days` : estimatedDays;
      }
    } catch (err) {
      console.warn('Shiprocket API call warning, using standard calculation:', err.message);
    }

    let deliveryFee = 0;
    let gstCharge = 0;
    let totalShipping = 0;

    if (isOnline) {
      // 100% Free delivery on all Prepaid / Online orders across India
      deliveryFee = 0;
      gstCharge = 0;
      totalShipping = 0;
    } else {
      // Dynamic COD delivery rate per pincode from Shiprocket
      if (bestCourier && bestCourier.rate) {
        // Shiprocket 'rate' is the total courier cost (including GST)
        totalShipping = Math.round(Number(bestCourier.rate));
        // Base courier freight fee (pre-GST)
        deliveryFee = Math.round(totalShipping / 1.18);
        // 18% GST component
        gstCharge = totalShipping - deliveryFee;
      } else {
        // Standard dynamic fallback scaled by weight (0.5 kg * items)
        const weightMultiplier = calculatedWeight / 0.5;
        totalShipping = Math.round(90 + Math.max(0, (weightMultiplier - 1) * 30));
        deliveryFee = Math.round(totalShipping / 1.18);
        gstCharge = totalShipping - deliveryFee;
      }
    }

    return {
      isServiceable: true,
      pincode: cleanPincode,
      courierPartner,
      expectedDate,
      estimatedDays,
      deliveryFee,
      gstCharge,
      shippingCharges: totalShipping,
      paymentMethod: isOnline ? 'ONLINE' : 'COD',
      isFreeDelivery: isOnline,
    };
  }

  /**
   * Sync and create order in Shiprocket dashboard
   */
  async createOrder(orderInput) {
    try {
      const Order = require('../models/Order');
      const mongoose = require('mongoose');
      let order = orderInput;
      if (typeof orderInput === 'string' || (orderInput && orderInput._bsontype)) {
        if (mongoose.Types.ObjectId.isValid(orderInput)) {
          order = await Order.findById(orderInput);
        } else {
          order = await Order.findOne({ orderNumber: orderInput });
        }
      }

      if (!order) {
        console.warn('[Shiprocket] Order not found for sync:', orderInput);
        return { success: false, error: 'Order not found' };
      }

      // Check if already synced
      if (order.shiprocketOrderId) {
        return {
          success: true,
          alreadySynced: true,
          order_id: order.shiprocketOrderId,
          shipment_id: order.shiprocketShipmentId,
        };
      }

      const token = await this.getToken();

      // Resolve address details
      let addr = order.shippingAddress || order.deliveryAddress || {};
      if (typeof addr === 'string' || (addr && addr._bsontype)) {
        try {
          const Address = require('../models/Address');
          const found = await Address.findById(addr).lean();
          if (found) addr = found;
        } catch (_) {}
      }

      const fullName = (addr.fullName || order.userName || 'Customer').trim();
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || 'Customer';
      const lastName = nameParts.slice(1).join(' ') || '';

      const rawPhone = String(addr.phoneNumber || addr.phone || '9876543210').replace(/[^0-9]/g, '');
      const cleanPhone = rawPhone.length >= 10 ? rawPhone.slice(-10) : '9876543210';

      const cleanPincode = String(addr.pincode || addr.postalCode || '201306').trim();
      const cleanCity = String(addr.city || 'Gautam Buddha Nagar').trim();
      const cleanState = String(addr.state || 'Uttar Pradesh').trim();
      
      let fullAddressParts = [
        addr.flatBuilding,
        addr.streetAddress,
        addr.landmark,
      ].filter(Boolean);
      let cleanAddress1 = fullAddressParts.join(', ').trim();
      if (cleanAddress1.length < 10) {
        cleanAddress1 = `${cleanAddress1 ? cleanAddress1 + ', ' : ''}${cleanCity}, ${cleanState}`;
      }
      const cleanAddress2 = String(addr.landmark || addr.flatBuilding || '').trim();

      // Format Items
      const orderItems = [];
      let totalUnits = 0;
      if (Array.isArray(order.items) && order.items.length > 0) {
        for (let i = 0; i < order.items.length; i++) {
          const it = order.items[i];
          const qty = Math.max(1, Number(it.quantity || it.qty) || 1);
          totalUnits += qty;
          const price = Math.max(1, Math.round(Number(it.price || it.priceSnapshot) || 100));
          const name = String(it.name || it.title || `Item ${i + 1}`).substring(0, 50);
          const rawSku = it.sku || (it.product && (it.product._id || it.product.id)) || it.product || `SKU-${Date.now()}-${i}`;
          const sku = String(rawSku).replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 30) || `SKU-${i + 1}`;

          orderItems.push({
            name,
            sku,
            units: qty,
            selling_price: price,
            discount: 0,
            tax: 0,
            hsn: 0,
          });
        }
      }

      if (orderItems.length === 0) {
        orderItems.push({
          name: 'Kosmico Wellness Product',
          sku: 'KW-PROD-01',
          units: 1,
          selling_price: Math.max(1, Math.round(Number(order.total || order.amount) || 100)),
          discount: 0,
          tax: 0,
          hsn: 0,
        });
        totalUnits = 1;
      }

      const calculatedWeight = Math.max(0.5, totalUnits * 0.5);

      // Order date formatted: "YYYY-MM-DD HH:mm"
      const d = order.createdAt ? new Date(order.createdAt) : new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const orderDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

      const isCod = (order.paymentMethod === 'COD' || order.paymentStatus === 'COD_PENDING') && order.paymentStatus !== 'PAID';
      let cleanOrderNumber = order.orderNumber;
      if (!cleanOrderNumber) {
        cleanOrderNumber = 'KW' + Date.now().toString().slice(-6) + Math.floor(100 + Math.random() * 900);
      }
      cleanOrderNumber = String(cleanOrderNumber).replace(/[^a-zA-Z0-9_-]/g, '');

      const payload = {
        order_id: cleanOrderNumber,
        order_date: orderDate,
        pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || 'work',
        channel_id: '',
        comment: 'Kosmico Wellness Order',
        billing_customer_name: firstName,
        billing_last_name: lastName,
        billing_address: cleanAddress1,
        billing_address_2: cleanAddress2,
        billing_city: cleanCity,
        billing_pincode: cleanPincode,
        billing_state: cleanState,
        billing_country: 'India',
        billing_email: order.userEmail || 'orders@kosmicowellness.com',
        billing_phone: cleanPhone,
        shipping_is_billing: true,
        shipping_customer_name: firstName,
        shipping_last_name: lastName,
        shipping_address: cleanAddress1,
        shipping_address_2: cleanAddress2,
        shipping_city: cleanCity,
        shipping_pincode: cleanPincode,
        shipping_state: cleanState,
        shipping_country: 'India',
        shipping_email: order.userEmail || 'orders@kosmicowellness.com',
        shipping_phone: cleanPhone,
        order_items: orderItems,
        payment_method: isCod ? 'COD' : 'Prepaid',
        shipping_charges: Number(order.shipping || order.deliveryFee) || 0,
        giftwrap_charges: 0,
        transaction_charges: 0,
        total_discount: Number(order.discount || order.discountAmount) || 0,
        sub_total: Math.max(1, Math.round(Number(order.total || order.amount) || 100)),
        length: 10,
        breadth: 10,
        height: 10,
        weight: calculatedWeight,
      };

      const response = await axios.post(`${this.baseUrl}/orders/create/adhoc`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const resData = response.data || {};
      const shiprocketOrderId = resData.order_id ? String(resData.order_id) : '';
      const shiprocketShipmentId = resData.shipment_id ? String(resData.shipment_id) : '';

      if (shiprocketOrderId) {
        await Order.findByIdAndUpdate(order._id, {
          orderNumber: cleanOrderNumber,
          shiprocketOrderId,
          shiprocketShipmentId,
          courierPartner: 'Shiprocket Express',
          orderStatus: 'Placed',
          shippingStatus: 'SYNCED_TO_SHIPROCKET',
          trackingNumber: 'TRK-' + cleanOrderNumber,
        });
        console.log(`[Shiprocket] Successfully created order ${cleanOrderNumber} -> Shiprocket Order ID: ${shiprocketOrderId}`);
      }


      return {
        success: true,
        order_id: shiprocketOrderId,
        shipment_id: shiprocketShipmentId,
        data: resData,
      };
    } catch (err) {
      console.error('[Shiprocket] Order creation error:', err.response?.data || err.message);
      return {
        success: false,
        error: err.response?.data?.message || err.message,
        details: err.response?.data,
      };
    }
  }

  /**
   * Track order shipment directly via Shiprocket
   */
  async trackShipment(shipmentId) {
    try {
      const token = await this.getToken();
      const response = await axios.get(`${this.baseUrl}/courier/track/shipment/${shipmentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (err) {
      console.error('[Shiprocket] Tracking error:', err.response?.data || err.message);
      return null;
    }
  }
}

module.exports = new ShiprocketService();
