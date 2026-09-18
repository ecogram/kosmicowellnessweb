require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');

const BASE_URL = 'http://127.0.0.1:5000/api';

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

async function runProductAdminVerification() {
  console.log('========================================================');
  console.log('🎯 VERIFYING PRODUCT MANAGEMENT APIS (ADMIN SIDE)');
  console.log('========================================================\n');

  let createdProductId = '';

  // 1. GET /products/admin/list
  console.log('--------------------------------------------------------');
  console.log('1️⃣ GET /api/products/admin/list (List all products for admin dashboard)');
  const listRes = await request('/products/admin/list');
  console.log(`Status: ${listRes.status} | Total Products:`, listRes.data?.data?.pagination?.total || listRes.data?.data?.products?.length || 0);

  // 2. POST /admin/products/add-product
  console.log('\n--------------------------------------------------------');
  console.log('2️⃣ POST /api/admin/products/add-product (Create a new product)');
  const addPayload = {
    name: 'Vitamin C Serum',
    price: 499,
    originalPrice: 899,
    description: 'Best serum',
    category: 'Skincare',
    countInStock: 50,
    stock: 50,
    visibility: 'true',
    brand: 'Kosmico',
  };
  console.log('Body:', addPayload);
  const addRes = await request('/admin/products/add-product', {
    method: 'POST',
    body: JSON.stringify(addPayload),
  });
  createdProductId = addRes.data?.data?.product?._id || addRes.data?.data?.product?.id;
  console.log(`Status: ${addRes.status} | Created Product ID: ${createdProductId}`);
  console.log('Response:', JSON.stringify(addRes.data, null, 2));

  // 3. PUT /admin/products/update-product/:id
  if (createdProductId) {
    console.log('\n--------------------------------------------------------');
    console.log(`3️⃣ PUT /api/admin/products/update-product/${createdProductId} (Edit product details)`);
    const updatePayload = {
      name: 'Vitamin C Serum (Updated)',
      price: 549,
      description: 'Updated premium glowing serum',
      brand: 'Kosmico Luxury',
    };
    console.log('Body:', updatePayload);
    const updateRes = await request(`/admin/products/update-product/${createdProductId}`, {
      method: 'PUT',
      body: JSON.stringify(updatePayload),
    });
    console.log(`Status: ${updateRes.status} | Response:`, JSON.stringify(updateRes.data, null, 2));

    // 4. PUT /products/admin/toggle-visibility/:id
    console.log('\n--------------------------------------------------------');
    console.log(`4️⃣ PUT /api/products/admin/toggle-visibility/${createdProductId} (Toggle product visibility)`);
    const toggleRes = await request(`/products/admin/toggle-visibility/${createdProductId}`, {
      method: 'PUT',
    });
    console.log(`Status: ${toggleRes.status} | Response:`, JSON.stringify(toggleRes.data, null, 2));

    // 5. POST /admin/products/extract-url
    console.log('\n--------------------------------------------------------');
    console.log('5️⃣ POST /api/admin/products/extract-url (Extract product data from external URL)');
    const extractPayload = { productUrl: 'https://example.com/ayurvedic-face-oil' };
    console.log('Body:', extractPayload);
    const extractRes = await request('/admin/products/extract-url', {
      method: 'POST',
      body: JSON.stringify(extractPayload),
    });
    console.log(`Status: ${extractRes.status} | Response:`, JSON.stringify(extractRes.data, null, 2));

    // 6. DELETE /products/admin/delete-product/:id
    console.log('\n--------------------------------------------------------');
    console.log(`6️⃣ DELETE /api/products/admin/delete-product/${createdProductId} (Delete a product)`);
    const deleteRes = await request(`/products/admin/delete-product/${createdProductId}`, {
      method: 'DELETE',
    });
    console.log(`Status: ${deleteRes.status} | Response:`, JSON.stringify(deleteRes.data, null, 2));
  }

  console.log('\n========================================================');
  console.log('🏁 PRODUCT MANAGEMENT APIS VERIFICATION COMPLETED');
  console.log('========================================================');
}

runProductAdminVerification();
