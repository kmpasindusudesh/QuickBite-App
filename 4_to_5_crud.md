# QuickBite — Members 4 & 5 CRUD Guide

**Project root:** `QuickBite_App/`  
**Backend:** `backend/`  
**Frontend:** `frontend/`

**Stack reminder:** App eke **`fetch`** + `useState` / `useEffect` / `useFocusEffect`; server eke **Express + Mongoose**. **JWT** hama request ekata. File upload walata **Multer** — `Content-Type` manual danna epa (boundary auto).

**If the lecturer asks "where is the API URL?"** → `frontend/src/config.js` (`API_BASE_URL`, `SERVER_URL`).

---

## Key difference: Order vs Delivery (Two separate MongoDB collections!)

This is the most important concept for both members.

| | **Order** (Member 4) | **Delivery** (Member 5) |
|---|---|---|
| **Model file** | `backend/models/Order.js` | `backend/models/Delivery.js` |
| **Collection name** | `orders` | `deliveries` |
| **Controller** | `backend/controllers/orderController.js` | `backend/controllers/deliveryController.js` |
| **Routes** | `backend/routes/orderRoutes.js` (`/api/orders`) | `backend/routes/deliveryRoutes.js` (`/api/deliveries`) |
| **Who uses it** | Customer (place/edit/cancel) + Manager (status update) | Rider only (accept/track/prove/cancel) |
| **Created when?** | Customer checks out from cart | Rider clicks "Accept Delivery" |
| **Main field** | `status: Pending → Preparing → Ready` | `status: Assigned → Picked Up → On the Way → Delivered` |
| **Photo upload** | `paymentSlip` (bank transfer proof — optional) | `deliveryProof` (mandatory when marking Delivered) |

> **Singlish viva tip:** *"Sir, Order collection eka customer ge kama eke history. Delivery collection eka rider ge task eka. Rende wenama collections — eka ekath ekka link karana field eka `orderId` (Delivery schema eke)."*

---

## Member 4 — Customer (Orders & Cart)

**Backend logic:** `backend/controllers/orderController.js`  
**Routes:** `backend/routes/orderRoutes.js` — base path `/api/orders`

| Operation | CRUD | Backend File | Frontend File |
|-----------|------|--------------|---------------|
| Add items to cart (local) | **Create** (local only) | *No API — AsyncStorage only* | `frontend/app/(tabs)/cart.js` |
| Place order (checkout) | **Create** | `backend/controllers/orderController.js` (`createOrder`) | `frontend/app/(tabs)/cart.js` |
| View my order history | **Read** | `backend/controllers/orderController.js` (`getOrders`) | `frontend/app/(tabs)/orders.js` |
| View one order details | **Read** | `backend/controllers/orderController.js` (`getOrderById`) | `frontend/app/(tabs)/orders.js` |
| Edit order (items / slip) | **Update** | `backend/controllers/orderController.js` (`updateOrder`) | `frontend/app/(tabs)/orders.js` |
| Cancel order | **Delete** | `backend/controllers/orderController.js` (`deleteOrder`) | `frontend/app/(tabs)/orders.js` |

**Supporting files**

| Layer | Path |
|-------|------|
| **Model** | `backend/models/Order.js` — `userId`, `restaurantId`, `items[]`, `totalAmount`, `status`, `paymentSlip`, `riderId`, `deliveryProof` |
| **Payment slip upload** | `backend/middleware/orderUploadMiddleware.js` — Multer field **`paymentSlip`** → `backend/uploads/slips/` |
| **JWT** | `backend/middleware/authMiddleware.js` — `protect` |
| **Cart storage** | `frontend/src/utils/storage.js` — `getCart`, `saveCart`, `clearCart` (AsyncStorage key `@cart_items`) |

---

### Member 4 — Step-by-step logic

### A) Add to cart (Create — local only) — `RestaurantDetailScreen.js`

Step 1: Customer `RestaurantDetailScreen` eke food item ekak "Add to Cart" press karanawa.  
Step 2: `getCart()` eken `AsyncStorage` eke thibba list eka gannawa.  
Step 3: Same `foodId` ekak already thiyanawa da check karanawa — thiyanawa nam `quantity++`; naththam nawa item ekak push karanawa `{ foodId, name, price, image, restaurantId, quantity: 1 }`.  
Step 4: `saveCart(updatedCart)` eken `AsyncStorage` update wenawa — **API call ekak naha**, phone eke local.

### B) Place order / Checkout (Create) — `cart.js` → `createOrder`

Step 1: Customer Cart tab eke items balala, `Confirm Order` button press karanawa.  
Step 2: Cart empty da check; `restaurantId` thiyanawa da check.  
Step 3: `getToken()` — naththam login ekata redirect.  
Step 4: `FormData` build karanawa:
- `items` → `JSON.stringify([{ foodId, quantity }, ...])` (string widihata)
- `totalAmount` → total bill string
- `restaurantId` → cart eke first item eke restaurantId
- `paymentSlip` → optional bank slip photo (field name **`paymentSlip`** — Multer ekata match)

Step 5: **`fetch(API_BASE_URL + '/orders', { method: 'POST', Authorization: Bearer, body: formData })`** — `Content-Type` manual danna epa.  
Step 6: Backend `createOrder`:
- `restaurantId` valid ObjectId da check
- `items` JSON parse (FormData eken string enawa)
- `totalAmount` positive number da check
- Slip thiyanam path save; `userId = req.user.id` — JWT eken (tamper baha)
- Status default **`Pending`**; save karanawa

Step 7: Success nam `clearCart()` + `router.replace('/home')`.

### C) View order history (Read) — `orders.js` → `getOrders`

Step 1: Orders tab load unama `loadOrders()` run wenawa — `useFocusEffect`.  
Step 2: **`fetch(API_BASE_URL + '/orders', { Authorization: Bearer })`** — GET.  
Step 3: Backend role check:
- **Customer/Rider** → `query.userId = req.user.id` — own orders witharak
- **Manager** → `query = {}` — okkoma orders (optional `?restaurantId=` filter)

Step 4: `populate('userId')`, `populate('restaurantId')`, `populate('items.foodId')` — food name, price, image dena karanawa.  
Step 5: Frontend eke status badge pennawa — `Pending` nam Edit + Cancel buttons; wenath status nam hide.

### D) Edit order (Update) — `orders.js` → `updateOrder`

Step 1: Customer order card eke **"Edit Order"** button — `status === 'Pending'` nam witharak pennawa.  
Step 2: Modal open wenawa — current items show karanawa; quantity +/- buttons; item remove button.  
Step 3: Optional new bank slip pick karanawa — `expo-image-picker`.  
Step 4: Save press kara **`PUT /api/orders/:id`** — same `FormData` format (items JSON + total + optional new slip).  
Step 5: Backend `updateOrder`:
- Manager nam 403 — me route eke manager edit baha
- Owner check — own order da
- **`status !== 'Pending'`** nam 400 — *"Order eka Preparing stage eke thiyenawa. Dan edit karanna baha!"*
- Items + total update; slip thiyanam replace

### E) Cancel order (Delete) — `orders.js` → `deleteOrder`

Step 1: Customer **"Cancel Order"** button press kara Alert confirm karanawa.  
Step 2: **`DELETE /api/orders/:id`** + Bearer token.  
Step 3: Backend `deleteOrder`:
- Owner hari Manager da check
- **Customer → `Pending` witharak cancel karanna puluwan** — Preparing/Ready nam 400
- **Manager → any status** delete karanna puluwan
- `findByIdAndDelete` — DB eken remove

---

## Member 5 — Rider (Delivery Management)

**Backend logic:** `backend/controllers/deliveryController.js`  
**Routes:** `backend/routes/deliveryRoutes.js` — base path `/api/deliveries`  
**All routes: Rider role only** — controller eke role check karanawa.

| Operation | CRUD | Backend File | Frontend File |
|-----------|------|--------------|---------------|
| View available orders (Ready pool) | **Read** | `backend/controllers/orderController.js` (`getAvailableOrders`) | `frontend/src/components/js/RiderDashboardScreen.js` (Available tab) |
| Accept delivery (create task) | **Create** | `backend/controllers/deliveryController.js` (`createDeliveryTask`) | `frontend/src/components/js/RiderDashboardScreen.js` → `acceptDelivery()` |
| View my active deliveries | **Read** | `backend/controllers/deliveryController.js` (`getRiderDeliveries`) | `frontend/src/components/js/RiderDashboardScreen.js` (Active tab) |
| Update delivery status (Picked Up / On the Way) | **Update** | `backend/controllers/deliveryController.js` (`updateDeliveryStatus`) | `frontend/src/components/js/RiderDashboardScreen.js` → `updateStatus()` |
| Upload proof photo + mark Delivered | **Update** (file upload) | `backend/controllers/deliveryController.js` (`updateDeliveryStatus`) | `frontend/src/components/js/RiderDashboardScreen.js` → `completeWithProof()` |
| Cancel delivery task | **Delete** | `backend/controllers/deliveryController.js` (`cancelDeliveryTask`) | `frontend/src/components/js/RiderDashboardScreen.js` → `cancelDelivery()` |

**Supporting files**

| Layer | Path |
|-------|------|
| **Model** | `backend/models/Delivery.js` — `orderId`, `riderId`, `status`, `deliveryProof`, `deliveredAt`; indexes on `{riderId,status}`, `{orderId}` |
| **Delivery proof upload** | `backend/middleware/deliveryUploadMiddleware.js` — Multer field **`deliveryProof`** → `backend/uploads/delivery/` |
| **Tab entry** | `frontend/app/(tabs)/rider-dashboard.js` → `RiderDashboardScreen` |

---

### Member 5 — Step-by-step logic

### A) View available orders (Read) — `RiderDashboardScreen.js` → `getAvailableOrders`

Step 1: Rider dashboard "Available Orders" tab load unama `loadAvailable()` run wenawa.  
Step 2: **`fetch(API_BASE_URL + '/orders/available', { Authorization: Bearer })`** — GET.  
Step 3: Backend `getAvailableOrders`:
- Role `rider` da check — naha nam 403
- `Order.find({ status: 'Ready', $or: [{ riderId: null }, { riderId: { $exists: false } }] })` — rider assign naththam + Ready orders witharak

Step 4: Frontend eke order cards pennawa — `#ORDER_ID`, customer name, restaurant, items, total, **"Accept Delivery"** button.

### B) Accept delivery (Create) — `RiderDashboardScreen.js` → `createDeliveryTask`

Step 1: Rider **"Accept Delivery"** button press karanawa — `orderId = String(order._id)`.  
Step 2: `orderId` undefined naththam guard block karanawa — error alert.  
Step 3: **`fetch(API_BASE_URL + '/deliveries', { method: 'POST', headers: { Authorization, 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId }) })`**.  
Step 4: Backend `createDeliveryTask`:
- Role `rider` da check
- Duplicate accept block — same order ekata already active delivery thiyanawa da check
- **Atomic Order update** — `findOneAndUpdate({ status: 'Ready', riderId: null }, { riderId, status: 'Picked Up' })` — race condition prevent
- **New `Delivery` document create** — `{ orderId, riderId, status: 'Assigned', deliveryProof: '' }` → `deliveries` collection ekata save

Step 5: Success — `refreshAll()` + active tab ekata switch wenawa.

### C) View my active deliveries (Read) — `RiderDashboardScreen.js` → `getRiderDeliveries`

Step 1: Rider "My Active Task" tab — `loadDeliveries()` run wenawa.  
Step 2: **`fetch(API_BASE_URL + '/deliveries', { Authorization: Bearer })`** — GET.  
Step 3: Backend `getRiderDeliveries` — `Delivery.find({ riderId: riderKey(req.user) }).sort({ createdAt: -1 })` — own deliveries witharak.  
Step 4: `populateDelivery()` eken `orderId` eke athule `userId`, `restaurantId`, `items.foodId` populate karanawa.  
Step 5: Frontend eke `status !== 'Delivered'` filter — active tasks witharak pennawa.

### D) Update delivery status (Update) — `RiderDashboardScreen.js` → `updateDeliveryStatus`

Step 1: Rider active task card eke status buttons:
- **"Picked Up"** → food restaurant eken gaththa
- **"Start Delivery"** → customer ekata yawanawa (On the Way)

Step 2: **`fetch(URL_DELIVERIES + '/' + deliveryId, { method: 'PUT', headers: { Authorization, 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) })`**.  
Step 3: Backend `updateDeliveryStatus`:
- Owner check — delivery eke `riderId == req.user.id`
- Already `Delivered` naththam 400
- Valid status check — `['Assigned', 'Picked Up', 'On the Way', 'Delivered']`
- **`Delivered` → file required** — `!req.file` naththam 400 (plain status update walata naha — proof upload walata ona)
- `delivery.save()` + **Order sync** — `Order.findByIdAndUpdate(delivery.orderId, { status: orderStatusMap[newStatus] })` — rende collections update wenawa

### E) ⭐ Proof of delivery photo + mark Delivered (Update with file upload) — `completeWithProof()`

> **This is Member 5's special CRUD operation — file upload + status change one shot.**

Step 1: Rider **"Complete Delivery"** button press karanawa — camera permission request.  
Step 2: `ImagePicker.launchCameraAsync()` — camera open wenawa; rider customer ta deliver karapu eka photo gannawa.  
Step 3: `FormData` build:
- **`deliveryProof`** field eken photo append (`uri`, `name`, `type`) — field name `deliveryUploadMiddleware.js` eke Multer ekata **exact match**
- `status` = `'Delivered'` append

Step 4: **`fetch(URL_DELIVERIES + '/' + deliveryId, { method: 'PUT', Authorization: Bearer, body: formData })`** — `Content-Type` manual danna epa.  
Step 5: Backend `updateDeliveryStatus`:
- `req.file` thiyanawa (Multer saved it) → `delivery.deliveryProof = 'uploads/delivery/filename.jpg'`
- `delivery.deliveredAt = new Date()`
- **Order status → `'Delivered'`**; `Order.deliveryProof` set wenawa
- Response: populated delivery doc

Step 6: `Alert('Delivered! ✅')` + `refreshAll()`.

### F) Cancel delivery (Delete) — `RiderDashboardScreen.js` → `cancelDeliveryTask`

Step 1: Rider **"Cancel"** button — Alert confirm.  
Step 2: **`DELETE /api/deliveries/:deliveryId`** + Bearer token.  
Step 3: Backend `cancelDeliveryTask`:
- Owner check
- **`On the Way` hari `Delivered` naththam cancel baha** — *"delivery eka 'On the Way' stage eke thiyenawa — dan cancel karanna baha!"*
- `Assigned` hari `Picked Up` → cancel OK
- **Order reset** → `findByIdAndUpdate(orderId, { riderId: null, status: 'Ready', deliveryProof: '' })` — order ayin pool ekata
- `Delivery.findByIdAndDelete(id)` — delivery doc remove

Step 4: `refreshAll()` — available tab eke order ayin pennawa.

---

## Status flow diagram

### Order status (Member 4 + Manager + Rider)

```
[Customer places order]
        ↓
    Pending       ← Customer can Edit / Cancel
        ↓  (Manager: PUT /api/orders/:id/status)
   Preparing      ← Customer CANNOT edit anymore
        ↓  (Manager: PUT /api/orders/:id/status)
     Ready        ← Rider pool ekata — available to accept
        ↓  (Rider accepts → POST /api/deliveries)
   Picked Up      ← Rider collected food from restaurant
        ↓  (Rider: PUT /api/deliveries/:id)
  On the Way      ← Rider is heading to customer
        ↓  (Rider: PUT /api/deliveries/:id + deliveryProof photo)
   Delivered  ✅  ← Final state
```

### Delivery status (Member 5 — separate `deliveries` collection)

```
[Rider clicks Accept → POST /api/deliveries]
        ↓
    Assigned       ← Delivery doc created; Order riderId set
        ↓  (Rider: "Picked Up" button)
   Picked Up       ← Rider at restaurant
        ↓  (Rider: "Start Delivery" button)
  On the Way       ← Cannot cancel after this point
        ↓  (Rider: "Complete Delivery" + camera photo)
   Delivered  ✅   ← deliveryProof saved; deliveredAt set
```

> **Note:** `cancelDelivery` (DELETE) is only possible at `Assigned` or `Picked Up` stages. Once `On the Way` — no going back.

---

## API map (exact URLs)

### Member 4 — Orders

| Method | URL | Auth | Who | What |
|--------|-----|------|-----|------|
| `POST` | `/api/orders` | JWT | Customer | Place order (FormData: items, totalAmount, restaurantId, paymentSlip) |
| `GET` | `/api/orders` | JWT | Customer/Manager | Customer → own; Manager → all |
| `GET` | `/api/orders/:id` | JWT | Owner/Manager | One order details |
| `PUT` | `/api/orders/:id` | JWT | Customer owner | Edit items/total/slip (Pending only) |
| `PUT` | `/api/orders/:id/status` | JWT | Manager only | Pending → Preparing → Ready |
| `DELETE` | `/api/orders/:id` | JWT | Customer (Pending) / Manager (any) | Cancel/delete order |

### Member 5 — Deliveries

| Method | URL | Auth | Who | What |
|--------|-----|------|-----|------|
| `GET` | `/api/orders/available` | JWT (Rider) | Rider | Ready + unassigned orders pool |
| `POST` | `/api/deliveries` | JWT (Rider) | Rider | Accept delivery (body: `{ orderId }`) → creates Delivery doc |
| `GET` | `/api/deliveries` | JWT (Rider) | Rider | Own delivery tasks list |
| `PUT` | `/api/deliveries/:id` | JWT (Rider) | Rider | Status update (JSON) OR proof upload + Delivered (FormData) |
| `DELETE` | `/api/deliveries/:id` | JWT (Rider) | Rider | Cancel task (Assigned/Picked Up only) |

**Critical Multer field names:**

| Upload | Field name | Where |
|--------|-----------|-------|
| Bank slip | `paymentSlip` | `backend/middleware/orderUploadMiddleware.js` |
| Delivery proof | `deliveryProof` | `backend/middleware/deliveryUploadMiddleware.js` |

---

## Quick "open these files" cheat sheet

| What to explain | Open this file |
|-----------------|----------------|
| Order schema (fields) | `backend/models/Order.js` |
| Delivery schema (fields) | `backend/models/Delivery.js` |
| Customer order CRUD | `backend/controllers/orderController.js` |
| Rider delivery CRUD | `backend/controllers/deliveryController.js` |
| Order routes (URL map) | `backend/routes/orderRoutes.js` |
| Delivery routes (URL map) | `backend/routes/deliveryRoutes.js` |
| Customer cart → checkout UI | `frontend/app/(tabs)/cart.js` |
| Customer order history UI | `frontend/app/(tabs)/orders.js` |
| Rider full dashboard UI | `frontend/src/components/js/RiderDashboardScreen.js` |

---

## Viva tips (Singlish)

> *"Sir, mama Member 4 walata Order collection ekak saha Member 5 walata Delivery collection ekak use kala — rende collection wenama. Order eka Customer create karanawa; Delivery eka Rider accept karakotat create wenawa."*

> *"Sir, Rider kenekage 'Accept Delivery' button press unama, backend eke atomic update ekak (findOneAndUpdate) use kala — eka rider kenekta eka time eka order ekak witharak assign wenna puluwan widihata. Race condition nawaththanawa."*

> *"Sir, Order cancel karanna Customer ta Pending witharak puluwan. Preparing/Ready wunama backend eke 400 error enawa — kitchen wada karanawa nisa cancel karanna dena naha."*

> *"Sir, Rider ta delivery cancel karanna On the Way ekata passe baha. Assigned hari Picked Up stage eke witharak cancel karanawa. Cancel unama Order eka ayin Ready pool ekata yawanawa — wenath rider kenekta access karanna puluwan."*

> *"Sir, delivery proof photo ganna camera use karanawa — gallery naha. Multer field name 'deliveryProof' kiyalai, frontend FormData eke name ekai match karanawa. Delivered status karanawa nam proof mandatory — backend validate karanawa."*

---

*Paths are relative to `QuickBite_App/`. Member 4 (Customer) + Member 5 (Rider) scope covers two separate models, two controllers, and two route files.*
