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

    try {
      const token = await this.getToken();
      const response = await axios.get(`${this.baseUrl}/courier/serviceability/`, {
        params: {
          pickup_postcode: pickupPincode,
          delivery_postcode: cleanPincode,
          weight: Math.max(0.5, Number(weight) || 0.5),
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
        // Standard fallback for local NCR
        totalShipping = 90;
        deliveryFee = 77;
        gstCharge = 13;
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
}

module.exports = new ShiprocketService();
