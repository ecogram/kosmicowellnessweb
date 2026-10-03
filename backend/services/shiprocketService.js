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
   * Automatically places real order on Shiprocket
   */
  async createShiprocketOrder(order) {
    if (!order) {
      throw new Error('Order object is required to place on Shiprocket');
    }

    const token = await this.getToken();
    const pickupLocation = 'work'; // Verified active pickup location for Kosmico Wellness

    const address = order.shippingAddress || order.billingAddress || order.deliveryAddress || {};
    const fullName = String(order.userName || address.fullName || address.name || 'Valued Customer').trim();
    const email = String(order.userEmail || order.email || address.email || 'customer@kosmicowellness.com').trim();
    const rawPhone = String(address.phone || address.phoneNumber || order.userPhone || '9876543210');
    const phone = rawPhone.replace(/\D/g, '').slice(-10) || '9876543210';
    
    let street = String(address.addressLine1 || address.streetAddress || address.address || address.flatBuilding || 'A423 Sector 1').trim();
    if (street.length < 5) street = street + ', Greater Noida';
    const street2 = String(address.addressLine2 || address.flatBuilding || '').trim();
    const city = String(address.city || 'Noida').trim();
    const state = String(address.state || 'Uttar Pradesh').trim();
    const pincode = String(address.postalCode || address.pincode || '201306').replace(/\D/g, '').slice(0, 6) || '201306';

    const isCod = order.paymentMethod === 'COD' || order.paymentMethod === 'COD_UPFRONT';
    const paymentMethod = isCod ? 'COD' : 'Prepaid';

    let codCollectAmount = Number(order.total) || 0;
    if (order.paymentMethod === 'COD_UPFRONT' && Number(order.upfrontAmount) > 0) {
      codCollectAmount = Math.max(0, codCollectAmount - Number(order.upfrontAmount));
    }
    const finalAmount = isCod ? codCollectAmount : (Number(order.total) || 0);

    const rawItems = Array.isArray(order.items) && order.items.length > 0 ? order.items : [];
    const orderItems = rawItems.length > 0
      ? rawItems.map((it, idx) => ({
          name: String(it.name || it.title || 'Sweet Monk Monk Fruit Sweetener 10ml').slice(0, 100),
          sku: String(it.sku || `KOSMICO-${String(it.product || it.productId || idx).slice(-6)}`).slice(0, 50),
          units: Number(it.quantity || it.qty || 1),
          selling_price: Math.max(1, Number(it.price || it.priceSnapshot || 499)),
          discount: 0,
          tax: 0,
          hsn: 2106,
        }))
      : [
          {
            name: 'Sweet Monk Monk Fruit Sweetener 10ml',
            sku: 'KOSMICO-6a9f68',
            units: 1,
            selling_price: Math.max(1, finalAmount),
            discount: 0,
            tax: 0,
            hsn: 2106,
          },
        ];

    const now = new Date();
    const YYYY = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const DD = String(now.getDate()).padStart(2, '0');
    const HH = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const orderDate = `${YYYY}-${MM}-${DD} ${HH}:${min}`;

    const payload = {
      order_id: String(order.orderNumber || order._id),
      order_date: orderDate,
      pickup_location: pickupLocation,
      channel_id: '',
      comment: 'Kosmico Wellness Web Order',
      billing_customer_name: fullName,
      billing_last_name: '',
      billing_address: street,
      billing_address_2: street2,
      billing_city: city,
      billing_pincode: pincode,
      billing_state: state,
      billing_country: 'India',
      billing_email: email,
      billing_phone: phone,
      shipping_is_billing: true,
      order_items: orderItems,
      payment_method: paymentMethod,
      shipping_charges: Number(order.shipping || order.deliveryFee || 0),
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: Number(order.discount || order.discountAmount || 0),
      sub_total: finalAmount,
      length: 10,
      breadth: 10,
      height: 10,
      weight: Math.max(0.5, orderItems.reduce((acc, it) => acc + (it.units * 0.5), 0)),
    };

    console.log('Sending real order to Shiprocket:', payload.order_id, 'Amount:', payload.sub_total, 'Method:', payload.payment_method);

    const response = await axios.post(`${this.baseUrl}/orders/create/adhoc`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  }

  /**
   * Fetches order details / status from Shiprocket
   */
  async getShiprocketOrder(shiprocketOrderId) {
    if (!shiprocketOrderId) return null;
    const token = await this.getToken();
    try {
      const response = await axios.get(`${this.baseUrl}/orders/show/${encodeURIComponent(shiprocketOrderId)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data?.data || response.data;
    } catch (err) {
      console.warn('Shiprocket show order error:', err.response?.data || err.message);
      return null;
    }
  }
}

module.exports = new ShiprocketService();

