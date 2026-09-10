# Kosmico Wellness - Edge Cases & Mitigation Strategies

## 1. Inventory & Cart

- **Product Out of Stock During Checkout**: Cart validation middleware must check real-time stock before creating the payment intent. Inform user gracefully.
- **Product Deleted While in Cart**: Cart population should ignore deleted products and notify the user that their cart was updated.
- **Price Changed After Product Added to Cart**: Always fetch the latest price from the database during checkout calculation. Never trust cart price from frontend.
- **Inventory Race Condition**: Use MongoDB atomic operators (`$inc: { stock: -qty }`) with a condition `{ stock: { $gte: qty } }`. If it fails, the item is out of stock.

## 2. Coupons

- **Coupon Expired While in Checkout**: Re-validate the coupon at the exact moment of order placement.
- **Usage Limit Reached**: Check per-user limit and global limit atomically during order creation.

## 3. Payments (Razorpay)

- **Payment Failed**: Keep order in `PENDING` or `FAILED` state. Allow user to retry payment from their order history.
- **Payment Succeeded but Frontend Disconnected**: The frontend might not redirect to success page. The Razorpay Webhook is the source of truth. Webhook updates order to `CONFIRMED` and triggers emails.
- **Duplicate Payment Webhook**: Webhook processing MUST be idempotent. Check if order status is already `CONFIRMED` before processing inventory deductions.
- **User Refreshes Checkout Page**: Use idempotent API keys or idempotency tokens for order creation to prevent duplicate orders.

## 4. System & Network

- **Network Failure During Add to Cart**: Implement retry logic on the frontend (TanStack Query) with user-friendly toast notifications.
- **Unauthorized Admin Request**: Strict RBAC middleware. If a user token is compromised but lacks `ADMIN` role, the API must reject with 403 Forbidden.
- **Session Expiration**: Frontend should intercept 401 errors, attempt silent token refresh, or gracefully redirect to login without losing cart state.
- **Database Load Spikes**: Implement Redis caching for product catalog and homepage data to shield MongoDB from read spikes.
