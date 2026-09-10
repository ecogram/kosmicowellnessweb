# Kosmico Wellness - Admin Requirements

## 1. Admin System Overview

The admin dashboard is a secure, private interface for store owners and managers to control the e-commerce platform. It must be efficient, data-dense, and highly responsive.

## 2. Core Sections

### 2.1 Dashboard Overview

- **Purpose**: High-level snapshot of business health.
- **Data Required**: Total Revenue (Daily/Monthly), Total Orders, Active Customers, Low Stock Alerts, Recent Orders list.
- **UI Element**: KPI cards, line chart (Revenue trend), Data table.

### 2.2 Products Management

- **Purpose**: CRUD operations for the catalog.
- **Main Actions**: Create product, edit details, upload images (via Cloudinary), manage variants, set price/discount, toggle Active/Draft status.
- **Validations**: Slug must be unique, price must be > 0, images must not exceed size limits.

### 2.3 Orders Management

- **Purpose**: Track and fulfill customer orders.
- **Main Actions**: View order details (Items, Shipping address, Payment status), Update order status (Pending -> Processing -> Shipped -> Delivered), Add tracking number.
- **Permissions**: Admin role required.

### 2.4 Customers Management

- **Purpose**: View user base and order history.
- **Main Actions**: View customer details, view their total spend, block/unblock accounts (security measure).

### 2.5 Inventory Management

- **Purpose**: Maintain accurate stock levels.
- **Main Actions**: View current stock per SKU, manually adjust stock quantities, receive low-stock visual indicators.
- **Important Validations**: Stock cannot be negative. Log manual overrides.

### 2.6 Reviews Moderation

- **Purpose**: Control public-facing product reviews.
- **Main Actions**: Approve, Reject, or Delete reviews. View associated order to verify purchase.

### 2.7 Coupons & Discounts

- **Purpose**: Create marketing promotions.
- **Main Actions**: Create coupon (Fixed amount or Percentage), set expiry date, set global usage limit, set per-user usage limit.

## 3. UI/UX System (Admin)

- **Layout**: Persistent left sidebar navigation, top bar for search and user profile, main content area.
- **Theme**: Clean, light theme (or toggleable dark mode). Less marketing-focused, more utility-focused than the public site.
- **Components**: Data tables with pagination/sorting/filtering, slide-out drawers or modals for editing records, status badges (e.g., Green for Delivered, Yellow for Pending, Red for Failed).
