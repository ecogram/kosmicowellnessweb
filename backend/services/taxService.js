const shippingService = require('./shippingService');

class TaxService {
  /**
   * Calculates tax/GST based on subtotal, address and payment method.
   * Product MRP is inclusive of product GST in India; courier GST applies on COD.
   */
  calculateTax(subtotal = 0, shippingAddress = {}, paymentMethod = 'ONLINE') {
    return shippingService.calculateGst(subtotal, shippingAddress, paymentMethod);
  }
}

module.exports = new TaxService();
