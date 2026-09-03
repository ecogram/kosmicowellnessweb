require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function cleanupTestProducts() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sweet-monk';
    await mongoose.connect(mongoUri);
    const Order = mongoose.model('Order', new mongoose.Schema({ items: Array }), 'orders');
    const Cart = mongoose.model('Cart', new mongoose.Schema({ items: Array }), 'carts');
    
    const testIds = ['6a898c0d0528b6a609e7269e', '6a898c24157e8e2ae3c8e10d'];
    const orders = await Order.find({'items.product': { $in: testIds }});
    const carts = await Cart.find({'items.product': { $in: testIds }});
    
    console.log('Orders with Test Product:', orders.length);
    console.log('Carts with Test Product:', carts.length);
    
    if (orders.length === 0 && carts.length === 0) {
      const Product = mongoose.model('Product', new mongoose.Schema({}), 'products');
      await Product.deleteMany({ _id: { $in: testIds } });
      console.log('Test Products deleted safely.');
    }
  } catch (e) {
    console.error('DB Error:', e.message);
  } finally {
    await mongoose.disconnect();
  }
}

cleanupTestProducts();
