require('dotenv').config({ path: './backend/.env' });
const express = require('express');

// Import all user-side route files directly
const authRoutes = require('./backend/routes/authRoutes');
const productRoutes = require('./backend/routes/productRoutes');
const categoryRoutes = require('./backend/routes/categoryRoutes');
const reviewRoutes = require('./backend/routes/reviewRoutes');
const paymentRoutes = require('./backend/routes/paymentRoutes');
const orderActionRoutes = require('./backend/routes/orderActionRoutes');
const wishlistRoutes = require('./backend/routes/wishlistRoutes');
const addressRoutes = require('./backend/routes/addressRoutes');
const returnRoutes = require('./backend/routes/returnRoutes');
const refundRoutes = require('./backend/routes/refundRoutes');
const postRoutes = require('./backend/routes/postRoutes');
const couponRoutes = require('./backend/routes/couponRoutes');
const emergencyRoutes = require('./backend/routes/emergencyRoutes');
const notificationRoutes = require('./backend/routes/notificationRoutes');
const systemRoutes = require('./backend/routes/systemRoutes');
const glucoRoutes = require('./backend/routes/glucoRoutes');
const updateRoutes = require('./backend/routes/updateRoutes');
const shiprocketRoutes = require('./backend/routes/shiprocketRoutes');

const routeModules = [
  { prefix: '/api/auth', name: 'Authentication (/api/auth)', router: authRoutes },
  { prefix: '/api/users', name: 'User Profile (/api/users)', router: authRoutes },
  { prefix: '/api/products', name: 'Products Catalog (/api/products)', router: productRoutes },
  { prefix: '/api/categories', name: 'Categories (/api/categories)', router: categoryRoutes },
  { prefix: '/api/products/:productId/reviews', name: 'Product Reviews Sub-router', router: reviewRoutes },
  { prefix: '/api/payment', name: 'Payments & Orders (/api/payment)', router: paymentRoutes },
  { prefix: '/api/payments', name: 'Payments & Orders (/api/payments)', router: paymentRoutes },
  { prefix: '/api/wishlist', name: 'Wishlist (/api/wishlist)', router: wishlistRoutes },
  { prefix: '/api/addresses', name: 'Addresses (/api/addresses)', router: addressRoutes },
  { prefix: '/api/address', name: 'Address Alias (/api/address)', router: addressRoutes },
  { prefix: '/api/return', name: 'Returns (/api/return)', router: returnRoutes },
  { prefix: '/api/refund', name: 'Refunds (/api/refund)', router: refundRoutes },
  { prefix: '/api/posts', name: 'Posts & Social (/api/posts)', router: postRoutes },
  { prefix: '/api/coupons', name: 'Coupons (/api/coupons)', router: couponRoutes },
  { prefix: '/api/emergency', name: 'Emergency Alerts (/api/emergency)', router: emergencyRoutes },
  { prefix: '/api/order', name: 'Order Actions & Tracking (/api/order)', router: orderActionRoutes },
  { prefix: '/api/notifications', name: 'Notifications (/api/notifications)', router: notificationRoutes },
  { prefix: '/api/gluco', name: 'Gluco Rhythm Health (/api/gluco)', router: glucoRoutes },
  { prefix: '/api/system', name: 'System Status (/api/system)', router: systemRoutes },
  { prefix: '/api/updates', name: 'App Updates (/api/updates)', router: updateRoutes },
  { prefix: '/api/shiprocket', name: 'Shiprocket Shipping (/api/shiprocket)', router: shiprocketRoutes },
];

const allEndpoints = [];

routeModules.forEach(({ prefix, name, router }) => {
  if (router && router.stack) {
    router.stack.forEach((layer) => {
      if (layer.route) {
        const routePath = layer.route.path;
        const methods = Object.keys(layer.route.methods).map((m) => m.toUpperCase());
        methods.forEach((method) => {
          const fullPath = (prefix + (routePath === '/' ? '' : routePath)).replace(/\/+/g, '/');
          allEndpoints.push({
            module: name,
            method,
            path: fullPath,
          });
        });
      }
    });
  }
});

console.log('========================================================================');
console.log(`📊 TOTAL ACTIVE BACKEND ENDPOINTS REGISTERED: ${allEndpoints.length}`);
console.log('========================================================================\n');

// Group by primary module
const grouped = {};
allEndpoints.forEach((ep) => {
  if (!grouped[ep.module]) grouped[ep.module] = [];
  grouped[ep.module].push(`${ep.method.padEnd(6, ' ')} ${ep.path}`);
});

let counter = 1;
for (const [moduleName, endpoints] of Object.entries(grouped)) {
  console.log(`\n🔹 ${moduleName} (${endpoints.length} Endpoints):`);
  endpoints.forEach((ep) => {
    console.log(`   ${counter.toString().padStart(2, ' ')}. ${ep}`);
    counter++;
  });
}

console.log('\n========================================================================');
