# 📋 Kosmico Wellness - Development Rules & Guidelines

Yeh document is project ke development, API management, database handling aur live deployment ke core rules define karta hai. Har developer aur AI assistant ko in rules ko strictly follow karna anivarya (mandatory) hai.

---

## 🛑 Rule 1: Code Verification & Live Production Deployment Standard
1. **Zero-Error Validation Before Deployment:**
   - Kisi bhi new code, bug fix, ya feature addition ke baad **Frontend Build (`npm run build`)** aur **Backend Integrity** ko verify kiya jayega.
   - Koi bhi broken code, untested changes, ya syntax errors live branch (`main`) par push nahi honge.
2. **Direct-to-Production Readiness:**
   - Code clean, optimized aur production server (`api.kosmicowellness.com` / `kosmicowellness.com`) par direct deploy hone ke liye fully compatible hona chahiye.
   - Secrets (`.env`, private keys) kabhi bhi Git me commit nahi honge.

---

## 📖 Rule 2: API Documentation Auto-Sync
1. **Mandatory Documentation Update:**
   - Jab bhi koi nayi API banegi ya existing API me parameters/response change hoga, uski complete details turant [`USER_API_DOCS.md`](./USER_API_DOCS.md) me document ki jayegi.
2. **Documentation Structure:**
   - Endpoint URL & Method (e.g., `POST /api/auth/login`)
   - Headers (Auth Token, Content-Type)
   - Request Body (Payload structure with examples)
   - Success & Error Response formats (with status codes).

---

## 🗄️ Rule 3: Database Integrity (Mobile App Database Fetch & Sync Policy)
1. **No Destructive Database Changes:**
   - MongoDB database me existing Mobile App ka live data aur collections chal rahe hain.
   - Database schema ko alter karna, collections delete/drop karna, ya existing fields ko unapproved format me mutate karna sakht mana hai.
2. **Read / Fetch & Safe Data Consumption:**
   - Web frontend aur backend ka mukhya kaam Mobile App ke existing database schema ko **fetch/read** karna aur existing standards ke anusaar hi sync karna hai.
   - Har naya model ya field existing Mobile App data structure ke sath 100% backward-compatible hona chahiye.

---

## 🛡️ Rule 4: Admin Panel & Admin APIs No-Touch Policy
1. **Isolated Admin System:**
   - Admin side ka panel, Admin controllers, aur Admin-specific APIs me koi bhi unapproved modification, overwrite, ya tampering nahi ki jayegi.
   - Admin authentication, admin routes, aur backend access control untouched rahenge.
2. **Separation of Concerns:**
   - User-facing web application sirf User APIs aur Customer operations par focus karegi. Admin system ki internal functioning independent rahegi.

---

## 🚀 Standard Git & Deployment Workflow
1. Code change complete karein.
2. `npm run build` se production bundle verify karein.
3. Agar nayi API hai toh `USER_API_DOCS.md` update karein.
4. Git commit & push karein:
   ```bash
   git add .
   git commit -m "feat/fix: <description>"
   git push origin main
   ```
5. Live server par pull karke restart karein (`git pull origin main && pm2 restart all`).
