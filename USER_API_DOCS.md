# 🌐 Kosmico Wellness - User Side Full API Documentation

This document provides a comprehensive reference for all client/user-side API endpoints implemented in the Kosmico Wellness application (`ApiService`).

---

## Base Configuration

- **Base URL:** `https://api.kosmicowellness.com/api`
- **Global Headers:**
  - `Content-Type`: `application/json`
  - `Accept`: `application/json`
  - `x-platform`: `ios` / `android` / `web`
  - `x-app-version`: `1.0.3`
  - `User-Agent`: `KosmicoApp/1.0`
  - `Authorization`: `Bearer <JWT_TOKEN>` *(Required for protected routes)*

---

## 1. Authentication & Users Module (`/api/auth` & `/api/users`)

### 1. Register User (Send Signup OTP)
- **Endpoint:** `POST /api/auth/register`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com"
  }
  ```

### 2. Verify Signup OTP
- **Endpoint:** `POST /api/auth/signup-verify`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "john@example.com",
    "otp": "123456"
  }
  ```

### 3. Login User (Send Login OTP)
- **Endpoint:** `POST /api/auth/login`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "john@example.com"
  }
  ```

### 4. Verify Login OTP
- **Endpoint:** `POST /api/auth/login-verify`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "john@example.com",
    "otp": "123456"
  }
  ```

### 5. Resend OTP
- **Endpoint:** `POST /api/auth/resend-otp`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "john@example.com",
    "purpose": "register"
  }
  ```
  *(Note: `purpose` can be `"register"` or `"login"`)*

### 6. Get User Profile (Protected)
- **Endpoint:** `GET /api/users/profile` *(also available at `GET /api/auth/profile`)*
- **Auth Required:** Yes (`Authorization: Bearer <JWT_TOKEN>`)
- **Response Example:**
  ```json
  {
    "statusCode": 200,
    "data": {
      "user": {
        "id": "67a1...",
        "name": "John Doe",
        "email": "john@example.com",
        "phoneNumber": "9876543210",
        "profilePicture": "https://api.kosmicowellness.com/uploads/profiles/pic.jpg",
        "role": "user",
        "isActive": true
      }
    },
    "message": "User data retrieved",
    "success": true
  }
  ```

### 7. Update User Profile (Protected)
- **Endpoint:** `PUT /api/users/profile` *(also available at `PUT /api/auth/profile`)*
- **Auth Required:** Yes (`Authorization: Bearer <JWT_TOKEN>`)
- **Request Body (JSON / FormData):**
  ```json
  {
    "name": "John Doe Updated",
    "phoneNumber": "9876543210"
  }
  ```
  *(Can also accept `profilePicture` as file upload via multipart/form-data)*

### 8. Remove Profile Picture
- **Endpoint:** `DELETE /api/auth/remove-profile-picture` *(also available at `DELETE /api/users/remove-profile-picture`)*
- **Auth Required:** Yes (`Authorization: Bearer <JWT_TOKEN>`)

---

## 2. Products & Categories Module (`/api/products` & `/api/categories`)

### 1. Get All Active Products (with Filters)
- **Endpoint:** `GET /api/products/`
- **Auth Required:** No
- **Query Parameters:** `category`, `search`, `minPrice`, `maxPrice`, `sortBy`, `page`, `limit`

### 2. Get Products for User List
- **Endpoint:** `GET /api/products/user/list`
- **Auth Required:** No
- **Query Parameters:** `page` (default: 1), `limit` (default: 12), `category`, `search`, `sortBy`

### 3. Get Distinct Product Categories
- **Endpoint:** `GET /api/products/categories`
- **Auth Required:** No

### 4. Get Bestseller Products
- **Endpoint:** `GET /api/products/bestsellers`
- **Auth Required:** No

### 5. Get Single Product Details
- **Endpoint:** `GET /api/products/:id` *(also supports slug: `GET /api/products/:slug`)*
- **Auth Required:** No

### 6. Get Reviews for a Product
- **Endpoint:** `GET /api/products/:id/reviews`
- **Auth Required:** No
- **Query Parameters:** `page`, `limit`

### 7. Add Review to a Product (Protected)
- **Endpoint:** `POST /api/products/:id/reviews`
- **Auth Required:** Yes (`Authorization: Bearer <JWT_TOKEN>`)
- **Request Body:**
  ```json
  {
    "rating": 5,
    "comment": "Amazing product!"
  }
  ```

### 8. Get All Categories
- **Endpoint:** `GET /api/categories/`
- **Auth Required:** No

### 9. Get User-Facing Categories List
- **Endpoint:** `GET /api/categories/user/list`
- **Auth Required:** No

---

## 3. Payments, Orders & Cart (`/api/payment` & `/api/payments`)

### 1. Create Razorpay Order (Protected)
- **Endpoint:** `POST /api/payment/razorpay/create`
- **Auth Required:** Yes (`Authorization: Bearer <JWT_TOKEN>`)
- **Request Body:**
  ```json
  {
    "amount": 999,
    "deliveryAddressId": "60d5ec49c...",
    "items": [
      {
        "product": "60d5ec49c...",
        "name": "Vitamin C Serum",
        "qty": 2,
        "price": 499
      }
    ],
    "couponCode": "WELCOME10",
    "discountAmount": 100,
    "deliveryFee": 50
  }
  ```

### 2. Verify Razorpay Payment (Protected)
- **Endpoint:** `POST /api/payment/razorpay/verify` *(also `/api/payment/verify`)*
- **Auth Required:** Yes (`Authorization: Bearer <JWT_TOKEN>`)
- **Request Body:**
  ```json
  {
    "razorpay_order_id": "order_...",
    "razorpay_payment_id": "pay_...",
    "razorpay_signature": "..."
  }
  ```

### 3. Create Cash on Delivery (COD) Order (Protected)
- **Endpoint:** `POST /api/payment/cod`
- **Auth Required:** Yes (`Authorization: Bearer <JWT_TOKEN>`)
- **Request Body:**
  ```json
  {
    "amount": 899,
    "deliveryAddressId": "60d5ec49c...",
    "items": [
      {
        "product": "60d5ec49c...",
        "name": "Vitamin C Serum",
        "qty": 1,
        "price": 899
      }
    ],
    "couponCode": "WELCOME10",
    "discountAmount": 100,
    "deliveryFee": 50
  }
  ```

### 4. Create COD Order with Upfront Payment (Protected)
- **Endpoint:** `POST /api/payment/cod-upfront/create`
- **Auth Required:** Yes (`Authorization: Bearer <JWT_TOKEN>`)
- **Request Body:**
  ```json
  {
    "amount": 1500,
    "upfrontAmount": 150,
    "deliveryAddressId": "60d5ec49c...",
    "items": [
      {
        "product": "60d5ec49c...",
        "name": "Vitamin C Serum",
        "qty": 2,
        "price": 750
      }
    ]
  }
  ```

### 5. Verify Upfront Razorpay Payment (Protected)
- **Endpoint:** `POST /api/payment/cod-upfront/verify`
- **Auth Required:** Yes (`Authorization: Bearer <JWT_TOKEN>`)
- **Request Body:**
  ```json
  {
    "razorpay_order_id": "order_...",
    "razorpay_payment_id": "pay_...",
    "razorpay_signature": "..."
  }
  ```

### 6. Get User Orders History (Protected)
- **Endpoint:** `GET /api/payments/myorders` *(also `GET /api/payment/myorders` and `GET /api/orders`)*
- **Auth Required:** Yes (`Authorization: Bearer <JWT_TOKEN>`)
- **Query Parameters:** `page`, `limit`

---

## 4. Address Management Module (`/api/address`)

### 1. Save Address
- **Endpoint:** `POST /api/address`
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "addressLabel": "Home",
    "fullName": "John Doe",
    "streetAddress": "123 Main St",
    "city": "Delhi",
    "pincode": "110001",
    "phoneNumber": "9876543210",
    "isDefault": true
  }
  ```

### 2. Get Saved Addresses
- **Endpoint:** `GET /api/address`
- **Auth Required:** Yes

### 3. Update Address
- **Endpoint:** `PUT /api/address/{addressId}`
- **Auth Required:** Yes
- **Request Body:** Same as Save Address fields.

### 4. Set Default Address
- **Endpoint:** `PUT /api/address/set-default/{addressId}`
- **Auth Required:** Yes

### 5. Delete Address
- **Endpoint:** `DELETE /api/address/{addressId}`
- **Auth Required:** Yes

---

## 5. Wishlist Module (`/api/wishlist`)

### 1. Get Wishlist
- **Endpoint:** `GET /api/wishlist`
- **Auth Required:** Yes

### 2. Add to Wishlist
- **Endpoint:** `POST /api/wishlist/add`
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "productId": "string"
  }
  ```

### 3. Remove from Wishlist
- **Endpoint:** `POST /api/wishlist/remove`
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "productId": "string"
  }
  ```

---

## 6. Coupons & Discounts (`/api/coupons`)

### 1. Get Available Coupons
- **Endpoint:** `GET /api/coupons`
- **Auth Required:** No

### 2. Verify / Apply Coupon
- **Endpoint:** `POST /api/coupons/verify` *(also `/api/coupons/apply`)*
- **Auth Required:** Optional (`Bearer Token`)
- **Request Body:**
  ```json
  {
    "code": "WELCOME10",
    "orderAmount": 1500
  }
  ```
- **Response:**
  ```json
  {
    "statusCode": 200,
    "data": {
      "code": "WELCOME10",
      "discountAmount": 150,
      "finalAmount": 1350,
      "originalAmount": 1500,
      "description": "Welcome 10% Discount"
    },
    "message": "Coupon applied successfully",
    "success": true
  }
  ```

---

## 7. Refunds & Replacements (`/api/refund`, `/api/return`)

- **Initiate Refund:** `POST /api/refund/initiate` (Body: `{"orderId": "...", "reason": "..."}`)
- **Get My Refunds:** `GET /api/refund/my-refunds`
- **Initiate Replacement:** `POST /api/return/initiate` (Body: `{"orderId": "...", "reason": "..."}`)
- **Get My Returns:** `GET /api/return/my-returns`

---

## 8. Shipping & Delivery Estimation (`/api/shiprocket`)

- **Estimate Delivery:** `POST /api/shiprocket/estimate-delivery`
  - **Request Body:**
    ```json
    {
      "deliveryPincode": "110001",
      "weight": 0.5,
      "paymentMethod": "COD"
    }
    ```

---

## 9. GlucoRhythm Module (`/api/gluco`)

- **Dashboard:** `GET /api/gluco/dashboard`
- **Log Glucose Reading:** `POST /api/gluco/reading`
  ```json
  {
    "glucoseLevel": 110.5,
    "timeOfDay": "Morning",
    "readingTime": "2023-10-25T10:00:00.000Z",
    "readingType": "Fasting",
    "notes": "Feeling good"
  }
  ```
- **Log Meal:** `POST /api/gluco/meal`
  ```json
  {
    "mealType": "Breakfast",
    "carbs": 45.0,
    "logTime": "...",
    "status": "Logged"
  }
  ```

---

## 10. Social / Community Posts Module (`/api/posts`)

- **Create Post:** `POST /api/posts` (Multipart, fields: `content`, `privacyLevel`, `tags`, `location`, file: `media`)
- **Get Feed:** `GET /api/posts/feed?page=1&limit=10`
- **Get User Posts:** `GET /api/posts/user/{userId}`
- **Like Post:** `POST /api/posts/{postId}/like`
- **Get Comments:** `GET /api/posts/{postId}/comments`
- **Add Comment:** `POST /api/posts/{postId}/comments` (Body: `{"text": "..."}`)
- **Edit Post:** `PUT /api/posts/{postId}` or `PATCH /api/posts/{postId}`
- **Delete Post:** `DELETE /api/posts/{postId}`
- **Friends / Requests:**
  - Send Request: `POST /api/posts/friend-request/send/{userId}` (Protected)
  - List Pending Requests: `GET /api/posts/friend-request/pending` (Protected)
  - Accept Request: `POST /api/posts/friend-request/accept/{requestId}` (Protected)
  - Reject Request: `POST /api/posts/friend-request/reject/{requestId}` (Protected)
  - Get Friends List: `GET /api/posts/friends` (Protected)
  - Get Requests List: `GET /api/posts/friend-requests` (Protected)

---

## 11. Notifications Module (`/api/notifications`)

- **Get Notifications:** `GET /api/notifications?page=1&limit=20`
- **Mark as Read:** `PUT /api/notifications/{notificationId}/read`
- **Delete Notification:** `DELETE /api/notifications/{notificationId}`
- **Clear All:** `DELETE /api/notifications`

---

## 12. Emergency & System Status (`/api/emergency`, `/api/system`)

- **Emergency Message Generator:** `POST /api/emergency/generate-message` (Fallback to GET)
  - **Body:** `{"latitude": 28.7041, "longitude": 77.1025}`
  - **Response:**
    ```json
    {
      "statusCode": 200,
      "data": {
        "message": "EMERGENCY ALERT: User requires urgent medical assistance. Current Location: https://maps.google.com/?q=28.7041,77.1025...",
        "smsText": "...",
        "location": {
          "latitude": 28.7041,
          "longitude": 77.1025,
          "mapsUrl": "https://maps.google.com/?q=28.7041,77.1025"
        },
        "helplineNumbers": ["112", "108", "102"]
      },
      "message": "Emergency SOS message generated successfully",
      "success": true
    }
    ```
- **System Status / Maintenance:** `GET /api/system/status`
- **App Update Check:** `GET /api/updates/check?version=1.0.3`
