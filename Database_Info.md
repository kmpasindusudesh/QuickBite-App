# QuickBite App — Database schema (from Mongoose models)

This document summarizes what is stored in MongoDB according to the Mongoose model files in `backend/models/`. Default Mongoose collection names are the lowercase, pluralized model names (e.g. model `User` → collection `users`).

---

## Collections overview

| Model name   | Typical MongoDB collection name |
|-------------|----------------------------------|
| User        | `users`                          |
| Restaurant  | `restaurants`                    |
| Food        | `foods`                          |
| Order       | `orders`                         |
| Delivery    | `deliveries`                     |
| Review      | `reviews`                        |

---

## 1. User (`users`)

**Fields**

| Field        | Type    | Notes |
|-------------|---------|--------|
| `name`      | String  | Required |
| `email`     | String  | Required, unique |
| `password`  | String  | Required (stored hashed in app logic) |
| `role`      | String  | Enum: `'customer'`, `'manager'`, `'rider'`; default `'customer'` |
| `profilePic`| String  | Default `''` (file path) |
| `phone`     | String  | Default `''`; optional; validated as 10 digits when non-empty |
| `createdAt` | Date    | Auto (schema option `timestamps: true`) |
| `updatedAt` | Date    | Auto |

**Relationships**

- No `ref` fields on this schema. Other models reference `User` via `userId` or `riderId`.

---

## 2. Restaurant (`restaurants`)

**Fields**

| Field           | Type   | Notes |
|----------------|--------|--------|
| `name`         | String | Required; trim; min length 2 |
| `address`      | String | Required; trim; min length 5 |
| `workingHours` | String | Default `''` |
| `logo`         | String | Default `''` (file path) |
| `createdAt`    | Date   | Auto |
| `updatedAt`    | Date   | Auto |

**Relationships**

- Referenced by: `Food.restaurantId` → `Restaurant`, `Order.restaurantId` → `Restaurant`.

---

## 3. Food (`foods`)

**Fields**

| Field          | Type     | Notes |
|---------------|----------|--------|
| `name`        | String   | Required; trim |
| `description` | String   | Default `''` |
| `price`       | Number   | Required; min `0.01` |
| `category`    | String   | Required |
| `image`       | String   | Default `''` (file path) |
| `restaurantId`| ObjectId | Required; **ref:** `'Restaurant'` |
| `createdAt`   | Date     | Auto |
| `updatedAt`   | Date     | Auto |

**Relationships**

- `restaurantId` → **Restaurant**
- Referenced by: `Order.items[].foodId` → `Food`, `Review.foodId` → `Food` (optional on Review)

---

## 4. Order (`orders`)

**Fields**

| Field           | Type     | Notes |
|----------------|----------|--------|
| `userId`       | ObjectId | Required; **ref:** `'User'` |
| `restaurantId` | ObjectId | Required; **ref:** `'Restaurant'` |
| `items`        | Array    | Array of embedded subdocuments (see below); must have at least one element |
| `totalAmount`  | Number   | Required; min `0` |
| `status`       | String   | Enum: `'Pending'`, `'Preparing'`, `'Ready'`, `'Picked Up'`, `'On the Way'`, `'Delivered'`; default `'Pending'` |
| `riderId`      | ObjectId | **ref:** `'User'`; default `null` |
| `deliveryProof`| String   | Default `''` |
| `paymentSlip`  | String   | Default `''` (file path) |
| `createdAt`    | Date     | Auto |
| `updatedAt`    | Date     | Auto |

**Embedded `items[]` subdocument (no separate `_id` per item)**

| Field      | Type     | Notes |
|-----------|----------|--------|
| `foodId`  | ObjectId | Required; **ref:** `'Food'` |
| `quantity`| Number   | Required; min `1` |

**Relationships**

- `userId` → **User**
- `restaurantId` → **Restaurant**
- `items[].foodId` → **Food**
- `riderId` → **User** (rider)
- Referenced by: `Delivery.orderId` → `Order`

---

## 5. Delivery (`deliveries`)

**Fields**

| Field            | Type     | Notes |
|-----------------|----------|--------|
| `orderId`       | ObjectId | Required; **ref:** `'Order'` |
| `riderId`       | ObjectId | Required; **ref:** `'User'` |
| `status`        | String   | Enum: `'Assigned'`, `'Picked Up'`, `'On the Way'`, `'Delivered'`; default `'Assigned'` |
| `deliveryProof` | String   | Default `''` |
| `deliveredAt`   | Date     | Default `null` |
| `createdAt`     | Date     | Auto |
| `updatedAt`     | Date     | Auto |

**Relationships**

- `orderId` → **Order**
- `riderId` → **User**

**Indexes (defined on schema, not stored as document fields)**

- Compound index: `{ riderId: 1, status: 1 }`
- Index: `{ orderId: 1 }`

---

## 6. Review (`reviews`)

**Fields**

| Field     | Type     | Notes |
|----------|----------|--------|
| `foodId` | ObjectId | Optional; **ref:** `'Food'` |
| `userId` | ObjectId | Required; **ref:** `'User'` |
| `rating` | Number   | Required; min `1`, max `5` |
| `comment`| String   | Default `''`; trim |
| `image`  | String   | Default `''` (file path) |
| `createdAt` | Date  | Auto |
| `updatedAt` | Date  | Auto |

**Relationships**

- `foodId` → **Food** (optional)
- `userId` → **User**

---

## Relationship map (refs only)

- **User** is referenced by: `Order.userId`, `Order.riderId`, `Review.userId`, `Delivery.riderId`
- **Restaurant** is referenced by: `Food.restaurantId`, `Order.restaurantId`
- **Food** is referenced by: `Order.items[].foodId`, `Review.foodId`
- **Order** is referenced by: `Delivery.orderId`

---

*Generated from: `backend/models/User.js`, `Restaurant.js`, `Food.js`, `Order.js`, `Delivery.js`, `Review.js`.*
