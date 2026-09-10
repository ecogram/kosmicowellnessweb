# Kosmico Wellness - Functional Requirements

## 1. Product System

- **User Action**: Browse products, view details.
- **Behavior**: Display product images, title, description, price, variants, and SEO meta tags.
- **Backend Support**: REST API `GET /api/v1/products`, `GET /api/v1/products/:slug`.
- **Edge Cases**: Product is inactive (hidden from public, visible to admin), variant out of stock.

## 2. Search & Filtering

- **User Action**: Search for products by name/keyword, filter by category/price.
- **Behavior**: Real-time or fast search results, update URL query params for shareability.
- **Backend Support**: Text indexes in MongoDB, aggregation pipeline for filtering.
- **Edge Cases**: Empty search results, invalid filter parameters.

## 3. Cart System

- **User Action**: Add/Remove items, update quantities.
- **Behavior**: Calculate subtotal dynamically. Validate stock on every update.
- **Backend Support**: Stored in DB (for logged-in users) or LocalStorage/Session (for guests) synced to DB upon login. API: `POST /api/v1/cart`.
- **Edge Cases**: Added item becomes out of stock before checkout, price changes while in cart.

## 4. Checkout & Payments

- **User Action**: Submit shipping info, choose payment, pay.
- **Behavior**: Lock inventory temporarily, process payment via Razorpay, create order, release inventory if failed.
- **Backend Support**: `POST /api/v1/orders`, Razorpay SDK integration, Webhook endpoint `POST /api/v1/webhooks/razorpay`.
- **Edge Cases**: Payment succeeds but user loses connection (rely on webhook), duplicate webhook delivery, payment failure.

## 5. Coupon System

- **User Action**: Apply promo code at checkout.
- **Behavior**: Validate code (expiry, usage limit, min cart value), calculate and display discount.
- **Backend Support**: `POST /api/v1/coupons/validate`.
- **Edge Cases**: Coupon expires while user is in checkout, user tries to apply multiple mutually exclusive coupons.

## 6. Inventory Management

- **User Action**: Admin updates stock; Customer purchases item.
- **Behavior**: Prevent overselling. Display "Low Stock" alerts.
- **Backend Support**: Atomic `$inc` operations in MongoDB.
- **Edge Cases**: Two users try to buy the last item at the exact same millisecond (Race condition).

## 7. Reviews & Ratings

- **User Action**: Customer submits review.
- **Behavior**: Review goes to pending state (if moderation enabled). Badge shows "Verified Buyer".
- **Backend Support**: `POST /api/v1/reviews`.
- **Edge Cases**: User tries to review a product they didn't buy, duplicate review submission.

## 8. Notifications

- **User Action**: Order status changes.
- **Behavior**: Send transactional email (Order confirmed, Shipped).
- **Backend Support**: BullMQ jobs triggering NodeMailer / external email service.
- **Edge Cases**: Email provider API goes down (queue should retry automatically).
