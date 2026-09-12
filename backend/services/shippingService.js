class ShippingService {
  /**
   * Calculates shipping fee based on payment method and subtotal.
   * - ONLINE: ₹0 (Free Delivery)
   * - COD: ₹77 (Shiprocket Delivery Fee)
   */
  calculateShipping(subtotal = 0, shippingAddress = {}, paymentMethod = 'ONLINE') {
    const isOnline = (paymentMethod || '').toUpperCase() === 'ONLINE' || (paymentMethod || '').toUpperCase() === 'PREPAID';
    
    if (isOnline) {
      return 0; // Free shipping on all Online prepaid orders
    }

    return 77; // Exact Shiprocket COD delivery fee
  }

  /**
   * Calculates GST on shipping/order.
   * - ONLINE: ₹0 GST
   * - COD: ₹13 GST (18% on courier charges)
   */
  calculateGst(subtotal = 0, shippingAddress = {}, paymentMethod = 'ONLINE') {
    const isOnline = (paymentMethod || '').toUpperCase() === 'ONLINE' || (paymentMethod || '').toUpperCase() === 'PREPAID';
    
    if (isOnline) {
      return 0;
    }

    return 13; // Exact Shiprocket GST on COD
  }
}

module.exports = new ShippingService();
