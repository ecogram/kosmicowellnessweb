# Testing Suites

This directory documents testing across the Kosmico Wellness project:

- **Backend Integration Tests**: Located in [`backend/tests/`](../backend/tests/)
  - `run-tests.js`: Concurrent inventory & checkout race condition tests
  - `payment-tests.js`: Razorpay payment verification tests
  - `phase11-tests.js` - `phase14-tests.js`: Role-based access control, Redis caching, and real-time Socket.IO notification tests
- **Frontend Verification**: TypeScript type-checking and production build verification (`npm run build --prefix frontend`)
