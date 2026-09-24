# Kosmico Wellness - Complete API Reference & Field Documentation

**Base URL**: `https://api.kosmicowellness.com/api`  
**Authentication**: Bearer Token in Request Headers (`Authorization: Bearer <JWT_TOKEN>`)  
**Content-Type**: `application/json` (Use `multipart/form-data` for file/media uploads)

---

## 1. Authentication & Profile APIs (`/api/auth` & `/api/users`)

### A. Register User (Send OTP)
- **Method**: `POST`
- **Endpoint**: `/api/auth/register`
- **Auth**: None (Public)
- **Request Body**:
```json
{
  "name": "Shubham Tiwari",
  "email": "shubham@example.com"
}
```

### B. Verify Signup OTP
- **Method**: `POST`
- **Endpoint**: `/api/auth/signup-verify`
- **Auth**: None (Public)
- **Request Body**:
```json
{
  "email": "shubham@example.com",
  "otp": "123456"
}
```

### C. Login User (Request OTP)
- **Method**: `POST`
- **Endpoint**: `/api/auth/login`
- **Auth**: None (Public)
- **Request Body**:
```json
{
  "email": "shubham@example.com"
}
```

### D. Verify Login OTP
- **Method**: `POST`
- **Endpoint**: `/api/auth/login-verify`
- **Auth**: None (Public)
- **Request Body**:
```json
{
  "email": "shubham@example.com",
  "otp": "123456"
}
```

### E. Resend OTP
- **Method**: `POST`
- **Endpoint**: `/api/auth/resend-otp`
- **Auth**: None (Public)
- **Request Body**:
```json
{
  "email": "shubham@example.com",
  "purpose": "login"
}
```

### F. Get Logged-in User Profile
- **Method**: `GET`
- **Endpoint**: `/api/users/profile` (or `/api/auth/profile`)
- **Auth**: Bearer Token required

### G. Update Profile Details
- **Method**: `PUT`
- **Endpoint**: `/api/users/profile` (or `/api/auth/profile`)
- **Auth**: Bearer Token required
- **Content-Type**: `multipart/form-data` or `application/json`
- **Request Fields**: `name`, `phoneNumber`, `profilePicture` (file)

---

## 2. Products & Categories APIs (`/api/products` & `/api/categories`)

### A. Get Products List (with Filters & Search)
- **Method**: `GET`
- **Endpoint**: `/api/products/user/list`
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Number of items (default: 12)
  - `category`: Category name
  - `search`: Keyword search
  - `sortBy`: `price_low` | `price_high` | `newest`
- **Auth**: None (Public)

### B. Get Bestsellers
- **Method**: `GET`
- **Endpoint**: `/api/products/bestsellers`
- **Auth**: None (Public)

### C. Get Product Details by ID or Slug
- **Method**: `GET`
- **Endpoint**: `/api/products/:id` (or `/api/products/:slug`)
- **Auth**: None (Public)

### D. Get Categories List
- **Method**: `GET`
- **Endpoint**: `/api/categories/user/list` (or `/api/categories`)
- **Auth**: None (Public)

### E. Product Reviews
- **Method**: `GET` | `POST`
- **Endpoint**: `/api/products/:productId/reviews`
- **Create Review Body** (Protected):
```json
{
  "rating": 5.0,
  "comment": "Excellent wellness product!"
}
```

---

## 3. Payments, Orders & Cart APIs (`/api/payment`)

### A. Create Razorpay Online Order
- **Method**: `POST`
- **Endpoint**: `/api/payment/razorpay/create`
- **Auth**: Bearer Token required
- **Request Body**:
```json
{
  "amount": 999.0,
  "deliveryAddressId": "60d5ec49c...",
  "items": [
    {
      "productId": "60d5ec49c...",
      "name": "Vitamin C Serum",
      "quantity": 2,
      "price": 499.0
    }
  ],
  "couponCode": "WELCOME10",
  "discountAmount": 100.0,
  "deliveryFee": 50.0,
  "gstCharge": 18.0
}
```

### B. Verify Razorpay Payment
- **Method**: `POST`
- **Endpoint**: `/api/payment/razorpay/verify` (or `/api/payment/verify`)
- **Auth**: Bearer Token required
- **Request Body**:
```json
{
  "razorpay_order_id": "order_EK5n...",
  "razorpay_payment_id": "pay_XYZ...",
  "razorpay_signature": "signature_hex..."
}
```

### C. Place 100% Cash on Delivery (COD) Order
- **Method**: `POST`
- **Endpoint**: `/api/payment/cod`
- **Auth**: Bearer Token required
- **Request Body**: Same item/address structure as Razorpay order.

### D. Create COD Upfront Payment (Advance Delivery Fee + GST)
- **Method**: `POST`
- **Endpoint**: `/api/payment/cod-upfront/create`
- **Auth**: Bearer Token required
- **Request Body**:
```json
{
  "amount": 1500.0,
  "upfrontAmount": 150.0,
  "deliveryAddressId": "60d5ec49c...",
  "items": [...]
}
```

### E. Verify COD Upfront Payment
- **Method**: `POST`
- **Endpoint**: `/api/payment/cod-upfront/verify`
- **Auth**: Bearer Token required
- **Request Body**: Same `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`.

### F. Customer Orders History
- **Method**: `GET`
- **Endpoint**: `/api/payments/myorders` (or `/api/payment/myorders`)
- **Query**: `?page=1&limit=20`
- **Auth**: Bearer Token required

---

## 4. GlucoRhythm Health Tracking APIs (`/api/gluco/*`)
*(Protected: Bearer Token required)*

### A. Log Glucose Reading
- **Method**: `POST`
- **Endpoint**: `/api/gluco/reading`
- **Request Body**:
```json
{
  "glucoseLevel": 120.5,
  "timeOfDay": "Morning",
  "readingType": "Fasting",
  "notes": "Feeling good and energetic"
}
```

### B. Log Meal
- **Method**: `POST`
- **Endpoint**: `/api/gluco/meal`
- **Request Body**:
```json
{
  "mealType": "Lunch",
  "carbs": 45.0,
  "description": "Salad and whole wheat roti"
}
```

### C. Health Tracking Dashboard
- **Method**: `GET`
- **Endpoint**: `/api/gluco/dashboard`
- **Response**: Array of recent glucose readings, logged meals, and weekly averages.

---

## 5. System Status & App Updates APIs (`/api/system/*`)
*(Public: No token required)*

### A. System Status (Health & Services)
- **Method**: `GET`
- **Endpoint**: `/api/system/status`
- **Response**:
```json
{
  "success": true,
  "data": {
    "status": "online",
    "version": "1.2.0",
    "serverTime": "2026-09-24T13:30:00.000Z",
    "services": {
      "database": "connected",
      "auth": "active",
      "payment": "ready",
      "shipping": "ready"
    }
  }
}
```

### B. Latest App Version & Update Info (Force / Soft Update)
- **Method**: `GET`
- **Endpoint**: `/api/system/updates/latest`
- **Response**:
```json
{
  "success": true,
  "data": {
    "latestVersion": "1.2.0",
    "minSupportedVersion": "1.0.0",
    "forceUpdate": false,
    "releaseNotes": "Performance improvements, real-time OTP enhancements, and live health sync.",
    "appStoreUrl": "https://apps.apple.com/app/kosmico-wellness",
    "playStoreUrl": "https://play.google.com/store/apps/details?id=com.kosmicowellness.app"
  }
}
```

---

## 6. Shiprocket Shipping Estimation (`/api/shiprocket/*`)

### A. Estimate Delivery Charges & Date
- **Method**: `POST`
- **Endpoint**: `/api/shiprocket/estimate-delivery`
- **Auth**: Optional
- **Request Body**:
```json
{
  "deliveryPincode": "400001",
  "weight": 0.5,
  "paymentMethod": "COD"
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "deliveryFee": 50.0,
    "gstCharge": 9.0,
    "estimatedDeliveryDate": "3-5 Business Days",
    "courierName": "Shiprocket Express"
  }
}
```

---

## 7. Notifications Management APIs (`/api/notifications/*`)
*(Protected: Bearer Token required)*

### A. Get User Notifications
- **Method**: `GET`
- **Endpoint**: `/api/notifications/`
- **Query**: `?page=1&limit=20`

### B. Mark Notification as Read
- **Method**: `PUT`
- **Endpoint**: `/api/notifications/:id/read`

### C. Delete Notification
- **Method**: `DELETE`
- **Endpoint**: `/api/notifications/:id`

### D. Clear All Notifications
- **Method**: `DELETE`
- **Endpoint**: `/api/notifications`

---

## 8. Wishlist APIs (`/api/wishlist/*`)
*(Protected: Bearer Token required)*

- `GET /api/wishlist` &rarr; Retrieve user's wishlist
- `POST /api/wishlist/add` &rarr; Body: `{ "productId": "..." }`
- `DELETE /api/wishlist/remove` (or `POST`) &rarr; Body: `{ "productId": "..." }`

---

## 9. Addresses Management (`/api/addresses` & `/api/address`)
*(Protected: Bearer Token required)*

- `GET /api/address` &rarr; List all saved addresses
- `POST /api/address` &rarr; Add new delivery address
- `PUT /api/address/:addressId` &rarr; Update address
- `DELETE /api/address/:addressId` &rarr; Delete address
- `PUT /api/address/set-default/:addressId` &rarr; Set as default delivery address

---

## 10. Coupons & Discounts (`/api/coupons`)

- `GET /api/coupons` &rarr; Get active promo coupons
- `POST /api/coupons/verify` &rarr; Body: `{ "code": "WELCOME10", "orderAmount": 999.0 }`

---

## 11. Returns & Refunds (`/api/return` & `/api/refund`)
*(Protected: Bearer Token required)*

- `POST /api/return/request` &rarr; Body: `{ "orderId": "...", "reason": "Damaged product" }`
- `POST /api/refund/request` &rarr; Body: `{ "orderId": "...", "reason": "Defective item" }`

---

## 12. Community & Emergency APIs

- `GET /api/posts/feed` &rarr; Community posts feed
- `POST /api/posts` &rarr; Create new community post (multipart)
- `POST /api/posts/:postId/like` &rarr; Like/Unlike post
- `POST /api/posts/:postId/comments` &rarr; Add comment
- `POST /api/emergency/generate-message` &rarr; Body: `{ "latitude": 28.7041, "longitude": 77.1025 }`
