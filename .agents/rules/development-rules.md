# Kosmico Wellness - Agent Development Rules (Hinglish)

Jab bhi is repository me kaam karein, strictly in 4 rules ko follow karein:

1. **Rule 1 (Build Verify, Commit aur Push):**
   - Naya code/fix complete hone ke baad `npm run build` verify karein.
   - Uske baad code ko `git commit` aur `git push origin main` ke liye ready/push karein taaki live production server par deploy ho sake.
   - `.env` ya secret keys ko commit nahi karna hai.

2. **Rule 2 (API Documentation Update):**
   - Agar koi nayi API banegi ya existing API badlegi, toh saath ke saath `USER_API_DOCS.md` file me complete endpoint details update karni hai.

3. **Rule 3 (Database Chhed-chhad Mana Hai - Sirf App ka Data Fetch Hoga):**
   - MongoDB me mobile app ka jo database/schema chal raha hai, use drop/alter nahi karna.
   - Web application sirf usi existing database se data fetch/read aur sync karegi.

4. **Rule 4 (Admin Side me Kuch Nahi Karna):**
   - Admin controllers, admin routes aur admin APIs ko bilkul touch nahi karna hai. Saara kaam sirf user-side par hoga.
