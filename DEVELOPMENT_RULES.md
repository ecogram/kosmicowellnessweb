# 📋 Kosmico Wellness - Development Rules (Hinglish)

Yeh document hamare project ke development, API updates, database handling aur live production deployment ke core rules define karta hai. In sabhi rules ko strictly follow karna mandatory hai:

---

### 🔹 Rule 1: Code Complete Hone ke Baad Build Verify, Commit aur Push Karna
* **Pehle Testing & Verification:**
  * Jab bhi koi naya code ya feature banega, pehle frontend build (`npm run build`) aur backend integrity check kiya jayega taaki 0 errors rahein.
* **Commit aur Push:**
  * Verification ke baad code ko proper meaningful commit message ke sath `git commit` aur `git push origin main` kiya jayega taaki live production server par direct deploy kiya ja sake.
  * Koi bhi broken ya untested code push nahi hoga.

---

### 🔹 Rule 2: Nayi API Bante hi API Documentation Update Karna
* **Documentation Sync:**
  * Agar koi bhi nayi API banayi jati hai ya existing API me parameters/response badalta hai, toh uski complete details turant [`USER_API_DOCS.md`](./USER_API_DOCS.md) me update ki jayegi.
  * Endpoint URL, Method (GET/POST/PUT/DELETE), Headers, Request Body, aur Success/Error Response format likhna zaroori hai.

---

### 🔹 Rule 3: Database me Kuch Chhed-chhad Nahi Karna (Sirf App ka Data Fetch Karna)
* **Mobile App Database Protection:**
  * MongoDB database me jo mobile app ka live data aur schema chal raha hai, use kisi bhi haal me modify, drop, ya delete nahi karna hai.
* **Safe Fetch & Sync:**
  * Web backend aur frontend sirf app ke existing database se data **fetch/read** karega aur usi structure ke anusaar data save/sync karega taaki mobile app me koi issue na aaye.

---

### 🔹 Rule 4: Admin Side aur Admin APIs me Kuch Nahi Karna
* **Admin Panel Isolation:**
  * Admin panel, admin controllers, aur admin APIs me koi bhi unapproved changes ya modifications nahi kiye jayenge.
  * Admin system fully isolated aur untouched rahega. Saara kaam sirf user-facing web features aur APIs par hoga.

---

### 🚀 Standard Deployment Workflow:
1. Code change complete karein.
2. `npm run build` se check karein ki build pass ho raha hai.
3. Agar API me change hua hai toh `USER_API_DOCS.md` update karein.
4. Code ko commit aur push karein:
   ```bash
   git add .
   git commit -m "feat/fix: aapka message"
   git push origin main
   ```
5. Live server par pull karke restart karein:
   ```bash
   git pull origin main
   pm2 restart all
   ```
