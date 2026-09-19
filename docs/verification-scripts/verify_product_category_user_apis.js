require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');

const BASE_URL = 'http://127.0.0.1:5000/api';
const testEmail = `review_tester_${Date.now()}@example.com`;

const request = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers || {}),
      },
    });
    const data = await res.json().catch(() => null);
    return { status: res.status, ok: res.ok, data };
  } catch (err) {
    return { status: 500, ok: false, error: err.message };
  }
};

async function runProductsCategoriesVerification() {
  console.log('========================================================');
  console.log('🎯 VERIFYING PRODUCTS & CATEGORIES APIS (USER SIDE)');
  console.log('========================================================\n');

  const mongoUri = process.env.MONGO_URI || 'mongodb+srv://KosmicoWellness:KosmicoWellness@cluster0.67auck3.mongodb.net/kosmico';
  await mongoose.connect(mongoUri);

  // 1. Authenticate user for protected review submission
  await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'Reviewer Tester', email: testEmail }),
  });

  const Otp = mongoose.model(
    'Otp_Temp_PC',
    new mongoose.Schema({ email: String, otp: String }, { strict: false }),
    'otps'
  );
  const otpDoc = await Otp.findOne({ email: testEmail.toLowerCase() }).sort({ createdAt: -1 });
  const authRes = await request('/auth/signup-verify', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail, otp: otpDoc ? otpDoc.otp : '123456' }),
  });
  const jwtToken = authRes.data?.data?.accessToken || authRes.data?.data?.token;
  const authHeaders = { Authorization: `Bearer ${jwtToken}` };

  console.log('🔑 Authenticated Reviewer Token:', jwtToken ? `${jwtToken.slice(0, 15)}...` : 'Failed');

  // 1. GET /products/
  console.log('--------------------------------------------------------');
  console.log('1️⃣ GET /api/products/ (Get all active products with filters)');
  const allProductsRes = await request('/products?category=Skincare&limit=5');
  console.log(`Status: ${allProductsRes.status} | Total Products:`, allProductsRes.data?.data?.length || allProductsRes.data?.data?.products?.length || 0);

  // 2. GET /products/user/list
  console.log('\n--------------------------------------------------------');
  console.log('2️⃣ GET /api/products/user/list (Get products for user list)');
  const userListRes = await request('/products/user/list?page=1&limit=8');
  console.log(`Status: ${userListRes.status} | Products Found:`, userListRes.data?.data?.length || userListRes.data?.data?.products?.length || 0);

  // 3. GET /products/categories
  console.log('\n--------------------------------------------------------');
  console.log('3️⃣ GET /api/products/categories (Get distinct product categories)');
  const categoriesRes = await request('/products/categories');
  console.log(`Status: ${categoriesRes.status} | Categories:`, categoriesRes.data?.data);

  // 4. GET /products/bestsellers
  console.log('\n--------------------------------------------------------');
  console.log('4️⃣ GET /api/products/bestsellers (Get bestseller products)');
  const bestsellersRes = await request('/products/bestsellers');
  console.log(`Status: ${bestsellersRes.status} | Bestsellers Count:`, bestsellersRes.data?.data?.products?.length || 0);

  // Find a sample product for detail and review tests
  const Product = mongoose.model(
    'Product_Temp_PC',
    new mongoose.Schema({ name: String, slug: String }, { strict: false }),
    'products'
  );
  const sampleProd = await Product.findOne({ isActive: true });
  const sampleProductId = sampleProd ? sampleProd._id.toString() : '6a5dc8bd878ae5943bebf6b4';

  console.log('\n🔎 Testing with Sample Product ID:', sampleProductId);

  // 5. GET /products/:id
  console.log('--------------------------------------------------------');
  console.log(`5️⃣ GET /api/products/${sampleProductId} (Get details of a single product)`);
  const singleProdRes = await request(`/products/${sampleProductId}`);
  console.log(`Status: ${singleProdRes.status} | Product Name:`, singleProdRes.data?.data?.product?.name || 'N/A');

  // 6. POST /products/:id/reviews
  console.log('\n--------------------------------------------------------');
  console.log(`6️⃣ POST /api/products/${sampleProductId}/reviews (Add a review to a product - Protected)`);
  const reviewPayload = { rating: 5, comment: 'Amazing product!' };
  console.log('Body:', reviewPayload);
  const addReviewRes = await request(`/products/${sampleProductId}/reviews`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(reviewPayload),
  });
  console.log(`Status: ${addReviewRes.status} | Response:`, JSON.stringify(addReviewRes.data, null, 2));

  // 7. GET /products/:id/reviews
  console.log('\n--------------------------------------------------------');
  console.log(`7️⃣ GET /api/products/${sampleProductId}/reviews (Get reviews for a product)`);
  const getReviewsRes = await request(`/products/${sampleProductId}/reviews`);
  console.log(`Status: ${getReviewsRes.status} | Reviews Count:`, getReviewsRes.data?.data?.reviews?.length || getReviewsRes.data?.data?.length || 0);

  // 8. GET /categories/
  console.log('\n--------------------------------------------------------');
  console.log('8️⃣ GET /api/categories/ (Get all categories)');
  const allCatsRes = await request('/categories');
  console.log(`Status: ${allCatsRes.status} | Categories:`, allCatsRes.data?.data?.categories?.length || allCatsRes.data?.data?.length || 0);

  // 9. GET /categories/user/list
  console.log('\n--------------------------------------------------------');
  console.log('9️⃣ GET /api/categories/user/list (Get user-facing categories list)');
  const userCatsRes = await request('/categories/user/list');
  console.log(`Status: ${userCatsRes.status} | Categories:`, userCatsRes.data?.data?.categories?.length || userCatsRes.data?.data?.length || 0);

  console.log('\n========================================================');
  console.log('🏁 PRODUCTS & CATEGORIES APIS VERIFICATION COMPLETED');
  console.log('========================================================');

  await mongoose.disconnect();
}

runProductsCategoriesVerification();
