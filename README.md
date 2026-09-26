# Kosmico Wellness — E-Commerce & Health Platform

![Kosmico Wellness](https://img.shields.io/badge/Status-Production%20Ready-emerald?style=for-the-badge)
![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite%20%2B%20TailwindCSS-blue?style=for-the-badge)
![Node](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express%20MVC-green?style=for-the-badge)
![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas%20%2B%20Redis-red?style=for-the-badge)

A high-performance, enterprise-grade Direct-to-Consumer (D2C) e-commerce and digital wellness platform for **Kosmico Wellness** — India's leading manufacturer of 100% natural, zero-calorie Sweet Monk sweeteners and Ayurvedic wellness products.

---

## 🚀 Key Platform Features

### 🛒 E-Commerce & Storefront
* **Dynamic Product Catalog:** Filter by categories (Sweeteners, Herbals, Essential Oils, Skin Care, Hair Care, Supplements) with sorting, instant search, and real-time inventory checks.
* **Interactive Cart & Drawer:** Slide-out interactive Cart Drawer with live subtotal calculations, tiered coupon discounts, and free shipping progress tracker.
* **Wishlist:** Instant heart-toggle wishlist synced to user account with local fallbacks.
* **Multi-Step Checkout:** Fast and seamless checkout supporting:
  * **Online Payment:** Razorpay Payment Gateway integration (UPI, Credit/Debit cards, Net Banking).
  * **Cash on Delivery (COD):** Verified address validation with instant order placement.
  * **Saved Payment Methods:** Secure tokenized storage for quick reorders.
* **Pincode Delivery Estimator:** Live Indian pincode verification estimating expected delivery days and courier eligibility.
* **Coupons & Promo Engine:** Real-time percentage & fixed discounts with expiry validation and usage limits.
* **Order Management & Invoices:** Real-time order status tracking (Placed, Confirmed, Shipped, Delivered), cancellation workflows, and PDF/HTML invoices.
* **Customer Reviews & Ratings:** Verified buyer reviews with star ratings and visual feedback.

### 🩺 Health & Care Suite
* **Everyday Usage & Recipe Guides:** Interactive guides showing 1:1 sugar replacements for hot beverages, baking, cold drinks, and breakfast bowls.
* **Clinical Health Targeting:** Specialized sections for Diabetic/Pre-diabetic glycemic stability, PCOS/PCOD care, and Keto weight management.
* **Kosmico Mobile App Integration:** Dedicated Play Store download modals and hanging quick-action links.
* **WhatsApp Live Support Widget:** Floating support widget connecting customers directly to Kosmico customer care.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS v4, Zustand, TanStack Query, React Router v7, Lucide Icons |
| **Backend** | Node.js, Express.js (MVC Architecture), Mongoose, Socket.io, Multer |
| **Database** | MongoDB Atlas (Primary Datastore), Redis (In-Memory Caching & Session Store) |
| **Background Queues** | BullMQ + Redis for asynchronous notifications, emails, and inventory sync |
| **Payments** | Razorpay SDK, Webhook verification |
| **Notifications** | Nodemailer (SMTP transactional emails), Realtime Web Push / In-App Notifications |
| **DevOps & Deploy** | Docker, Docker Compose, Nginx, Vercel (`vercel.json`), AWS EC2 (`ec2-deploy.sh`) |

---

## 📁 Repository Structure

```
Kosmico_Wellness_Web/
├── .env.example                # Global environment variable template
├── .gitignore                  # Git ignore rules for node, envs, builds, and media
├── docker-compose.yml          # Production multi-container orchestration
├── docker-compose.dev.yml      # Local dev orchestration (MongoDB, Redis, Node, Vite)
├── ec2-deploy.sh               # Automated deployment script for AWS EC2 instances
├── backend/                    # Node.js + Express API Backend
│   ├── config/                 # Database (MongoDB), Redis, and service configs
│   ├── controllers/            # Request handlers (Auth, Products, Orders, Payments, etc.)
│   ├── middleware/             # JWT auth, RBAC, Rate Limiting, File Upload
│   ├── models/                 # Mongoose schemas (User, Product, Order, Coupon, Review, etc.)
│   ├── routes/                 # Express API v1 route definitions
│   ├── services/               # Business logic (Payment, Email, Pincode, Queue)
│   ├── realtime/               # Socket.io event dispatchers
│   ├── uploads/                # Local user avatars & product media storage
│   ├── tests/                  # Automated integration and phase test suites
│   ├── server.js               # Application bootstrap & HTTP/WS listener
│   └── package.json            # Backend dependencies & test scripts
├── frontend/                   # React 19 + TypeScript + Vite Single Page Application
│   ├── public/                 # Static assets (Lifestyle photos, logos, reports)
│   ├── src/
│   │   ├── components/         # Reusable UI components (Navbar, Footer, Cart, Layouts)
│   │   ├── features/home/      # Home page modular sections (Hero, HowItWorks, Benefits, etc.)
│   │   ├── hooks/              # Custom React Query & state hooks (useProducts, useCart, etc.)
│   │   ├── pages/              # Routed pages (Home, Shop, Checkout, Profile, Orders, Care, etc.)
│   │   ├── services/           # Axios HTTP client & API service endpoints
│   │   ├── store/              # Zustand global state (AuthStore, CartDrawerStore)
│   │   ├── style.css           # Global Tailwind CSS styles and theme variables
│   │   └── App.tsx             # Root router and modal provider
│   └── vite.config.ts          # Vite build config with manual chunk splitting
└── docs/                       # Architecture diagrams and API specifications
```

---

## ⚡ Quick Start Guide

### 1. Prerequisites
* **Node.js** >= 20.x
* **npm** >= 10.x
* **MongoDB** (Local instance or MongoDB Atlas URI)
* **Redis** (Optional for local dev; required for BullMQ queues)

### 2. Environment Configuration
Create `.env` in the root (or `backend/.env` and `frontend/.env`):

```bash
# In backend/.env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/kosmico
JWT_ACCESS_SECRET=your_jwt_access_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# In frontend/.env
VITE_API_URL=http://localhost:5000/api/v1
```

### 3. Installation & Running Locally

```bash
# 1. Install root, backend, and frontend dependencies
npm run install:all

# 2. Run both Frontend and Backend concurrently
npm run dev
```

* **Frontend Client:** [http://localhost:5173](http://localhost:5173)
* **Backend API:** [http://localhost:5000/api/v1](http://localhost:5000/api/v1)

---

## 🧪 Testing & Verification

Run automated backend and integration tests:

```bash
# Run all backend tests
cd backend
npm test

# Run phase integration test suite
node tests/phase13-tests.js
```

Build and validate the frontend production bundle:

```bash
cd frontend
npm run build
```

---

## 🚢 Deployment

### Vercel (Frontend SPA)
The project includes `frontend/vercel.json` with SPA catch-all rewrites configured for instant zero-config deployments on Vercel.

### Docker & AWS EC2 (Full Stack)
```bash
# Using Docker Compose
docker compose -f docker-compose.yml up -d --build

# Or using the EC2 deployment script
chmod +x ec2-deploy.sh
./ec2-deploy.sh
```

---

## 📄 License & Attribution

Copyright © 2026 **KOSMICO WELLNESS PRIVATE LIMITED**. All rights reserved.  
*Ancient Wisdom, Modern Living.*

