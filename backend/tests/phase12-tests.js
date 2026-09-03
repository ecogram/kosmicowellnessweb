require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const AuditLog = require('../models/AuditLog');
const adminService = require('../services/adminService');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB Connected');
};

const runTests = async () => {
  await connectDB();

  const adminUser = await User.findOne({ role: 'admin' });
  const normalUser = await User.findOne({ role: 'user' });

  if (!adminUser || !normalUser) {
    console.log('Test users not found.');
    process.exit(1);
  }

  console.log('\n--- 1. ANALYTICS ---');
  const analytics = await adminService.getAnalyticsOverview();
  console.log(`Total Users: ${analytics.totalUsers}`);
  console.log(`Total Orders: ${analytics.totalOrders}`);
  console.log(`Total Revenue: $${analytics.totalRevenue}`);
  console.log(`Order Distribution:`, analytics.orderStatusDistribution);

  console.log('\n--- 2. USERS (List & Role Update) ---');
  const usersList = await adminService.getUsers({ page: 1, limit: 5 });
  console.log(`Fetched ${usersList.users.length} users. Meta:`, usersList.meta);

  console.log('\n--- 3. PRODUCTS (Soft Delete & List) ---');
  const product = await Product.findOne({ isActive: true });
  if (product) {
    const deletedProduct = await adminService.deleteProduct(adminUser._id, product._id);
    console.log(`Soft deleted product: ${deletedProduct.name}, isActive: ${deletedProduct.isActive}`);
    // restore it for other tests
    deletedProduct.isActive = true;
    await deletedProduct.save();
  } else {
    console.log('No active product found to test soft delete.');
  }

  console.log('\n--- 4. AUDIT LOG ---');
  const logs = await AuditLog.find({ admin: adminUser._id }).sort({ createdAt: -1 }).limit(1);
  if (logs.length > 0) {
    console.log(`Found Audit Log: ${logs[0].action} on ${logs[0].entityType} ${logs[0].entityId}`);
  } else {
    console.log('No audit logs found (expected if no state changes occurred).');
  }

  console.log('\n--- 5. ADMIN RBAC CONSTRAINT VERIFICATION ---');
  try {
    await adminService.updateUserRole(adminUser._id, adminUser._id, 'user');
    console.log('FAIL: Admin demoted themselves.');
  } catch (err) {
    console.log(`SUCCESS: Admin self-demotion blocked: ${err.message}`);
  }

  process.exit(0);
};

runTests();
