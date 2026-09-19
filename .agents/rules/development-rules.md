# Kosmico Wellness - Agent Development Rules

Whenever working in this repository, strictly adhere to these 4 core rules:

1. **Rule 1 (Verification & Production Readiness):**
   - Always verify and test new code (run frontend build `npm run build` and backend syntax/lint checks) before staging/committing.
   - Code must be 100% production ready for deployment to the live server.
   - Never commit `.env` or sensitive secret keys.

2. **Rule 2 (API Documentation Synchronization):**
   - Whenever creating a new API or modifying an existing API endpoint, request schema, or response schema, immediately update `USER_API_DOCS.md` with complete details (method, endpoint, params, request body, headers, and responses).

3. **Rule 3 (Database Integrity & Mobile App Compatibility):**
   - Do NOT alter, drop, or disrupt existing MongoDB collections, indexes, or field structures used by the mobile app.
   - Fetch and read the existing mobile app database schema safely. Maintain 100% backward compatibility for all data operations.

4. **Rule 4 (Admin Side & Admin APIs Isolation):**
   - Do NOT modify, delete, or tamper with Admin-side controllers, Admin routes, or Admin endpoints. Keep admin functionality isolated and untouched.
