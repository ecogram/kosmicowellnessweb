# Kosmico Wellness - User Flows

## 1. Primary Customer Journey (Shopping Flow)

1. **Landing (Home Page)**
   - User lands on homepage via organic search or ad.
   - Views hero banner, trust indicators, and top benefits.
   - Action: Clicks "Shop Now" or a specific product card.

2. **Product Discovery & Details**
   - User arrives at the Product Detail Page (PDP).
   - Views image gallery, reads description, nutritional facts, and ingredients.
   - Reads customer reviews and FAQs.

3. **Variant Selection & Add to Cart**
   - User selects a variant (e.g., 250g, 500g, Pack of 3).
   - Adjusts quantity.
   - Action: Clicks "Add to Cart". (Stock validated dynamically).

4. **Cart Drawer / Cart Page**
   - Cart drawer slides open (or navigates to cart page).
   - User reviews items, sees subtotal, and shipping estimate.
   - Action: Clicks "Proceed to Checkout".

5. **Authentication (Optional/Mandatory based on config)**
   - If guest checkout is disabled: User is prompted to Login or Register.
   - If guest checkout is enabled: User proceeds directly, providing email.

6. **Address & Shipping**
   - User selects an existing saved address or enters a new shipping/billing address.
   - System calculates shipping costs based on location/weight.

7. **Checkout & Payment Method**
   - User reviews order summary (subtotal, shipping, taxes, discounts).
   - Enters promo code (if applicable).
   - Selects Payment Method: Online Payment (Razorpay) or Cash on Delivery (COD).

8. **Payment Processing**
   - If Online: Redirected to Razorpay gateway or inline modal. Payment is processed. Webhook updates backend securely.
   - If COD: Order is placed immediately (pending verification).

9. **Order Confirmation**
   - User is redirected to `/order-success/:orderId`.
   - Sees order number, estimated delivery, and summary.
   - Receives order confirmation email (via background job).

10. **Order Tracking**
    - User visits Customer Dashboard -> "My Orders".
    - Clicks on specific order to view timeline (Pending -> Processing -> Shipped -> Delivered).

11. **Post-Purchase (Review)**
    - After delivery, user receives an email prompt to review.
    - User navigates to PDP or Dashboard to submit a star rating and text review.
