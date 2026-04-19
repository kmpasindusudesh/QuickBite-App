# QuickBite — General Feedback & Ratings (Member 6) — Full CRUD Guide

**Project root:** `QuickBite_App/`  
**Backend:** `backend/`  
**Frontend:** `frontend/`

**API base:** `frontend/src/config.js` — `API_BASE_URL` (includes `/api`), `SERVER_URL` for feedback photos (`uploads/reviews/...`).

**Stack:** App eke **`fetch`** + `useState` / `useEffect` / `useFocusEffect`; server eke **Express + Mongoose**.  
**Business logic:** `backend/controllers/reviewController.js` (`getReviews`, `createReview`, `updateReview`); **DELETE** saha **GET /food/:foodId** eka `backend/routes/reviewRoutes.js` eke inline.

> **Member 6: Food ekak select karanne nathuwa general review ekak danna puluwan widihata logic eka update kala. Meka app eke general feedback system eka widihata wada karanawa.**  
> **Member 6: General reviews keepayak danna puluwan wenna database eke thibba unique index eka ain kala. Dan foodId null unath duplicate error enne naha.**

---

## 1. Does it work? (current status)

| Flow | Status |
|------|--------|
| **List all feedback** — `GET /api/reviews` | **Yes** — `ReviewScreen.js` (customer tab) + `ManagerDashboardScreen.js` (reviews tab) |
| **Post general feedback** — no food required | **Yes** — `POST /api/reviews`; `foodId` optional; **no duplicate block** |
| **Post feedback with food link** — `foodId` optional | **Yes** — if `foodId` sent, controller validates it exists; still no duplicate block |
| **Edit own feedback** — `PUT /api/reviews/:id` | **Yes** — owner only; rating + comment; backend enforced |
| **Delete feedback** — `DELETE /api/reviews/:id` | **Yes** — owner **or** manager; `ReviewScreen.js` + `ManagerDashboardScreen.js` |
| **Food-specific list + average** — `GET /api/reviews/food/:foodId` | **Backend route exists** — no frontend screen calls it yet |
| **Unique index (DB)** | **Removed** — schema has no `unique` index; `server.js` auto-drops old index on startup |

---

## 2. CRUD table — Backend file + Frontend file

| Operation | CRUD | Backend file | Frontend file |
|-----------|------|--------------|---------------|
| List all feedback (public; optional `?foodId=` filter) | **Read** | `backend/controllers/reviewController.js` (`getReviews`) | `frontend/src/components/js/ReviewScreen.js` · `frontend/src/components/js/ManagerDashboardScreen.js` |
| List feedback for one food + averageRating | **Read** | `backend/routes/reviewRoutes.js` (inline `GET /food/:foodId`) | *No screen calls this yet — backend ready* |
| Post general feedback (rating + comment + optional photo) | **Create** | `backend/controllers/reviewController.js` (`createReview`) | `frontend/src/components/js/ReviewScreen.js` |
| Edit own feedback (rating + comment) | **Update** | `backend/controllers/reviewController.js` (`updateReview`) | `frontend/src/components/js/ReviewScreen.js` (edit modal) |
| Delete feedback | **Delete** | `backend/routes/reviewRoutes.js` (inline `DELETE /:id`) | `frontend/src/components/js/ReviewScreen.js` · `frontend/src/components/js/ManagerDashboardScreen.js` |

### Supporting files

| Layer | Path | Role |
|-------|------|------|
| **Schema / Model** | `backend/models/Review.js` | `foodId` optional, `userId` required, `rating` 1–5, `comment`, `image`; **no unique index** |
| **Index auto-drop** | `backend/server.js` | Drops old `foodId_1_userId_1` index on every startup — silently skips if already gone |
| **JWT middleware** | `backend/middleware/authMiddleware.js` | `protect` → `req.user.id`, `req.user.role` |
| **Photo upload** | `backend/middleware/reviewUpload.js` | Multer `upload.single('reviewImage')` → `backend/uploads/reviews/` |
| **Routes** | `backend/routes/reviewRoutes.js` | Mounts all 5 endpoints; inline DELETE + GET /food/:foodId handlers |
| **Server mount** | `backend/server.js` | `app.use('/api/reviews', reviewRoutes)` |
| **Feedback UI** | `frontend/src/components/js/ReviewScreen.js` | Customer: post / edit / delete own; shows "General Feedback" label |
| **Manager UI** | `frontend/src/components/js/ManagerDashboardScreen.js` | Manager: view all + delete any (moderation) |
| **Styles** | `frontend/src/components/css/ReviewScreenStyles.js` | Green dark theme |
| **Tab routes** | `frontend/app/(tabs)/reviews.js` → `ReviewScreen` | `frontend/app/(tabs)/manager-dashboard.js` |
| **Storage** | `frontend/src/utils/storage.js` | `getToken`, `getUser` |

---

## 3. API map (exact paths)

Base: `API_BASE_URL` = `http://<IP>:5000/api`

| Method | Path | Auth | Handler | Notes |
|--------|------|------|---------|-------|
| `GET` | `/api/reviews` | Public | `getReviews` | Optional query `?foodId=<mongoId>` |
| `GET` | `/api/reviews/food/:foodId` | Public | Inline in `reviewRoutes.js` | Returns `{ reviews, count, averageRating }` |
| `POST` | `/api/reviews` | JWT (`protect`) | `createReview` + `upload.single('reviewImage')` | `foodId` body field optional |
| `PUT` | `/api/reviews/:id` | JWT | `updateReview` + optional `reviewImage` | Owner only |
| `DELETE` | `/api/reviews/:id` | JWT | Inline in `reviewRoutes.js` | Owner **or** manager |

**Critical — Multer field name:** Frontend `ReviewScreen.js` constant `REVIEW_IMAGE_FORM_FIELD = 'reviewImage'` must match `upload.single('reviewImage')` in `reviewRoutes.js`. Sending `image` instead → **"Unexpected field"** error.

---

## 4. Step-by-step logic (Singlish + English)

### A) Load feedback list (Read) — `ReviewScreen.js`

Step 1: Screen mount saha tab focus unama `loadReviews()` run wenawa — `useEffect` saha `useFocusEffect` dekenma call karanawa.  
Step 2: **`fetch(API_BASE_URL + '/reviews')`** — GET, public route, token naha.  
Step 3: Response eka array nam `setReviews(data)` karanawa; empty nam `setAvgRating(null)`.  
Step 4: Average eka **frontend eke** calculate wenawa — okkoma ratings sum kara count eken divide (`toFixed(1)`).  
Step 5: Manager dashboard eke reviews tab eke same `GET /reviews` — JWT header ekka yawanawa (backend public nisa harm naha; extra security layer).

### B) Post general feedback (Create) — `ReviewScreen.js` → `createReview`

Step 1: **Manager role nam** "Share Your Feedback" section **pennenne naha** — UI level block.  
Step 2: Customer/Rider star 1–5 select karanawa; optional comment type karanawa; optional photo pick karanawa (gallery).  
Step 3: `getToken()` eken JWT gannawa — naththam "login ona" alert.  
Step 4: `FormData` build karanawa:
- `rating` — string widihata append
- `comment` — trim kara append
- Photo thibboth: **`reviewImage`** field name eken file object append (`uri`, `name`, `type`)
- **`foodId` append karanne naha** — general feedback widihata save wenawa  

Step 5: **`fetch(...'/reviews', { method: 'POST', headers: { Authorization: Bearer }, body: formData })`** — `Content-Type` manual danna epa (boundary auto).  
Step 6: Backend `createReview`:
- Rating 1–5 validate
- `foodId` naha → direct proceed; thiyanam → valid ObjectId + food exists check (no duplicate block anymore)
- `userId` = `req.user.id` — JWT eken; body eken fake karanna baha  

Step 7: DB ekata save kara populate kara return.  
Step 8: Success nam form clear (`rating=0`, `comment=''`, `image=null`) + `loadReviews()` refresh.

### C) Edit feedback (Update) — `ReviewScreen.js` → `updateReview`

Step 1: Feedback card eke **owner** witharak **pencil icon** (Edit) pennanawa — `canEdit = isOwner && role !== 'manager'`.  
Step 2: Bottom-sheet modal eke rating star + comment wenas karanawa.  
Step 3: Save press kara validation — rating 1–5 athara da.  
Step 4: **`fetch(...'/reviews/' + editReviewId, { method: 'PUT', Authorization: Bearer, body: formData })`** — `rating` + `comment` FormData.  
Step 5: Backend `updateReview`:
- Review load karannawa
- `String(review.userId) === jwtUserId` — owner naththam 403
- Rating validate; comment update; image — new file upload naththam replace, naththam existing keep  

Step 6: Updated doc return; modal close + `loadReviews()`.

### D) Delete feedback (Delete) — `ReviewScreen.js` / `ManagerDashboardScreen.js`

Step 1: **Owner** hari **Manager** witharak Delete button pennanawa (`canDelete = isOwner || role === 'manager'`).  
Step 2: Alert confirm karannawa.  
Step 3: **`fetch(...'/reviews/' + reviewId, { method: 'DELETE', Authorization: Bearer })`**.  
Step 4: Backend inline handler:
- Review load → `isOwner = String(review.userId) === req.user.id` · `isManager = role === 'manager'`
- Rende nam naha naththam → 403
- OK nam `findByIdAndDelete`  

Step 5: Frontend — `loadReviews()` hari local state filter kara list update.

### E) List feedback for one food (Read — backend only)

Step 1: **`GET /api/reviews/food/:foodId`** — inline handler in `reviewRoutes.js`.  
Step 2: `Review.find({ foodId }).populate('userId','name').populate('foodId','name').sort({ createdAt: -1 })`.  
Step 3: `averageRating` = `reduce` sum / length, `toFixed(1)` — response JSON: `{ count, averageRating, reviews }`.  
Step 4: **No frontend screen calls this URL currently** — Postman eken test karanna puluwan; future `FoodDetailScreen` integration possible.

---

## 5. Unique index removal — how it works

| Step | What happened |
|------|---------------|
| **Schema** | `reviewSchema.index(...)` with `unique: true` line **removed** from `backend/models/Review.js` — Mongoose no longer creates the index on new databases |
| **Controller** | `findOne` duplicate check block **removed** from `createReview` — `11000` catch block also removed |
| **DB cleanup** | `backend/server.js` runs `collection('reviews').dropIndex('foodId_1_userId_1')` after MongoDB connect — auto-drops the old index that still lived in Atlas/local DB |

**How the auto-drop works in `server.js`:**

```js
mongoose.connection.collection('reviews')
    .dropIndex('foodId_1_userId_1')
    .then(() => console.log('Reviews unique index drop una ✅'))
    .catch(() => console.log('Reviews index already naha — skip ✅'));
```

- First server start after the fix → **"Reviews unique index drop una ✅"** terminal eke enawa.  
- Every start after that → **"Reviews index already naha — skip ✅"** — crash naha, harmless.

---

## 6. Security & rules (viva bullets)

- **`userId` on create:** JWT eken auto — client body eken fake userId danna baha.
- **No duplicate block:** Eka user eka feedback form eke keepayak submit karanna puluwan — general feedback system.
- **`foodId` optional:** Naththam general feedback (`foodId` field set naha); thiyanam valid ObjectId + food exists check still runs.
- **Update:** Owner witharak — backend `String()` compare (ObjectId vs string mismatch avoid).
- **Delete:** Owner **or** manager — manager eka offensive reviews delete karanna (moderation).
- **Rating:** Always 1–5 — backend `min`/`max` validate + controller number check.
- **Photo field name:** `reviewImage` — rende side match karanawa (Multer `Unexpected field` prevent).

---

## 7. UI labels (what changed in `ReviewScreen.js`)

| Old label | New label |
|-----------|-----------|
| Screen title: "Reviews" | **"General Feedback"** |
| Subtitle: "Community feed — rate QuickBite..." | **"Share your experience with QuickBite"** |
| Form heading: "Add Review" | **"Share Your Feedback"** |
| Feed heading: "What everyone says" | **"Community Feedback"** |
| Card label (no food): `'QuickBite (general)'` | **`'General Feedback'`** |
| Card icon (no food): `restaurant-outline` | **`chatbubble-outline`** |
| Empty list: "Thawa reviews naha..." | **"Thawa feedback naha..."** |
| Success alert: "Review add una!" | **"Feedback add una!"** |

---

## 8. Viva tips (Singlish)

> *"Sir, me system eka general feedback system eka — food ekak select karanne nathuwa review danna puluwan. `foodId` optional widihata wada karanawa."*

> *"Sir, unique index eka remove kala — Dan eka user keepayak feedback danna puluwan. Database eke parana index eka `server.js` eken auto drop karanawa — server start unama."*

> *"Sir, photo ekakata Multer use kara — field name `reviewImage` kiyala frontend eken backend eken match karanawa. `image` dapu nam Unexpected field error enawa."*

> *"Sir, `userId` eka JWT eken gannawa — POST body eken hack karanna baha. Owner check + Manager delete RBAC dekenma thiyenawa."*

---

## 9. Quick "open these files" cheat sheet

| What to explain | Open this file |
|-----------------|----------------|
| Schema (fields, no unique index) | `backend/models/Review.js` |
| Create / Read / Update logic | `backend/controllers/reviewController.js` |
| Routes + Delete + GET by food | `backend/routes/reviewRoutes.js` |
| Index auto-drop on startup | `backend/server.js` (`.then()` block after `mongoose.connect`) |
| Customer feedback UI (full CRUD) | `frontend/src/components/js/ReviewScreen.js` |
| Manager moderation (view + delete) | `frontend/src/components/js/ManagerDashboardScreen.js` |
| Multer config (field: reviewImage) | `backend/middleware/reviewUpload.js` |

---

*Paths are relative to `QuickBite_App/`. All three recent changes (general feedback UI labels, duplicate check removal, unique index drop) are reflected above.*
