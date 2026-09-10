# Kosmico Wellness - Information Architecture

## 1. Sitemap

### Public Pages
- `/` - Home (Hero, Benefits, Social Proof, Interactive Demo, Buy Now)
- `/shop` - Product Catalog (Filter by category, dietary tags, price)
- `/product/:slug` - Product Detail Page (Images, description, nutrition, reviews, quantity selector, add to cart, sticky buy bar on mobile)
- `/cart` - Full Cart Page (and slide-over cart drawer from any page)
- `/checkout` - Multi-step Checkout (Email/Phone -> Shipping -> Payment)
- `/about` - Brand Story, Mission, monk fruit sourcing & science
- `/faq` - Frequently Asked Questions (searchable, categorized)
- `/comparison` - Kosmico Wellness vs. Sugar vs. Other Substitutes
- `/reviews` - Global Customer Reviews
- `/faq` - Frequently Asked Questions
- `/contact` - Customer Support / Contact Form
- `/terms` - Terms of Service
- `/privacy` - Privacy Policy

## 2. Customer Portal (Requires Auth)

- `/login` - Login Page
- `/register` - Registration Page
- `/forgot-password` - Password Recovery
- `/reset-password/:token` - Password Reset
- `/account` - Dashboard Overview
- `/account/profile` - Personal Information Management
- `/account/addresses` - Address Book (CRUD)
- `/account/orders` - Order History
- `/account/orders/:id` - Detailed Order View / Tracking
- `/account/wishlist` - Saved Products (Wishlist)

## 3. Shopping Flow

- `/cart` - Full Cart Page (in addition to Cart Drawer)
- `/checkout` - Multi-step Checkout Process
- `/checkout/success/:orderId` - Order Confirmation Page

## 4. Admin Portal (Requires Admin Auth)

- `/admin/login` - Secure Admin Login
- `/admin` - Dashboard (Metrics & Overview)
- `/admin/products` - Product Management
- `/admin/categories` - Category Management
- `/admin/orders` - Order Fulfillment & Tracking
- `/admin/customers` - Customer Directory
- `/admin/reviews` - Review Moderation
- `/admin/coupons` - Discount & Promo Code Management
- `/admin/inventory` - Stock Monitoring & Alerts
- `/admin/payments` - Transaction Logs
- `/admin/settings` - Global Store Settings
