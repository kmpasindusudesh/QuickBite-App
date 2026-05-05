# QuickBite App — Food Component

**Component Owner:** Member 3  
**Module:** Food Item Management  
**Repository:** QuickBite-App  
**Stack:** React Native (Expo) | Node.js | Express.js | MongoDB | Cloudinary

---

## Table of Contents

1. [Component Overview](#1-component-overview)
2. [File Structure](#2-file-structure)
3. [Backend](#3-backend)
   - [Food Model](#31-food-model)
   - [Food Controller](#32-food-controller)
   - [Food Routes](#33-food-routes)
   - [Food Upload Middleware](#34-food-upload-middleware)
4. [Frontend Screens](#4-frontend-screens)
   - [AddFoodScreen](#41-addfoodscreen)
   - [EditFoodScreen](#42-editfoodscreen)
   - [FoodDetailScreen](#43-fooddetailscreen)
   - [RestaurantDetailScreen](#44-restaurantdetailscreen)
5. [Route Wrapper Files](#5-route-wrapper-files)
6. [Stylesheet Files](#6-stylesheet-files)
7. [API Reference](#7-api-reference)
8. [Middleware Chain](#8-middleware-chain)
9. [Role-Based Access Control](#9-role-based-access-control)
10. [Integration with Other Components](#10-integration-with-other-components)
11. [Shared Dependencies](#11-shared-dependencies)
12. [Configuration](#12-configuration)
13. [Technologies Used](#13-technologies-used)

---

## 1. Component Overview

The Food Component manages the complete lifecycle of food items within the QuickBite food delivery application. It provides full CRUD (Create, Read, Update, Delete) operations for food items, enforces role-based access control so that only users with the Manager role may modify data, and handles food image storage via Cloudinary in production. Customers may browse food items and add them to their cart. The component integrates with the Restaurant component (Member 2), the Cart and Orders component (Member 4), and the Reviews component (Member 6).

---

## 2. File Structure

```
QuickBite-App/
|
|-- backend/
|   |-- models/
|   |   `-- Food.js
|   |-- controllers/
|   |   `-- foodController.js
|   |-- routes/
|   |   `-- foodRoutes.js
|   `-- middleware/
|       `-- foodUploadMiddleware.js
|
`-- frontend/
    |-- app/
    |   `-- (tabs)/
    |       |-- add-food.js
    |       |-- edit-food.js
    |       |-- food-detail.js
    |       `-- restaurant-detail.js
    `-- src/
        `-- components/
            |-- js/
            |   |-- AddFoodScreen.js
            |   |-- EditFoodScreen.js
            |   |-- FoodDetailScreen.js
            |   `-- RestaurantDetailScreen.js
            `-- css/
                |-- AddFoodScreenStyles.js
                |-- FoodDetailScreenStyles.js
                `-- RestaurantDetailScreenStyles.js
```

**Shared files used by this component (not exclusively owned):**

```
backend/
|-- config/cloudinaryConfig.js
|-- middleware/authMiddleware.js
`-- server.js

frontend/
|-- src/config.js
`-- src/utils/storage.js
```

---

## 3. Backend

### 3.1 Food Model

**File:** `backend/models/Food.js`

Defines the Mongoose schema for a food item stored in MongoDB. Every document in the `foods` collection follows this structure.

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | String | Yes | Name of the food item |
| `description` | String | No | Optional text description |
| `price` | Number | Yes | Price of the item in LKR |
| `category` | String | Yes | One of the defined category values |
| `image` | String | No | Cloudinary URL or relative file path of the food image |
| `restaurantId` | ObjectId (ref: Restaurant) | Yes | Foreign key linking to a Restaurant document |
| `createdAt` | Date | Auto | Timestamp added by Mongoose timestamps option |
| `updatedAt` | Date | Auto | Timestamp added by Mongoose timestamps option |

**Permitted category values:** Burger, Pizza, Drinks, Dessert, Rice, Snacks, Other

---

### 3.2 Food Controller

**File:** `backend/controllers/foodController.js`

Contains all business logic for food item operations. This file exports four controller functions and one internal helper.

#### `resolveRestaurantId(value)`

An internal helper function that accepts a restaurant identifier (either a MongoDB ObjectId or a restaurant name string), queries the Restaurant collection, and returns the validated ObjectId. If the restaurant is not found, it returns null. This is called before any create or update operation to ensure referential integrity.

---

#### `addFood` — Create a Food Item

**Route:** `POST /api/food/add`  
**Access:** Manager only

Processing steps:

1. Reads `name`, `price`, `category`, `restaurantId`, and `description` from `req.body`.
2. Calls `resolveRestaurantId()` to verify the restaurant exists. Returns `400` if not found.
3. Reads the uploaded image path from `req.file` (set by Cloudinary Multer middleware). Stores the Cloudinary URL or an empty string if no image was uploaded.
4. Creates a new `Food` document and saves it to the database.
5. Returns the saved document with status `201`.

**Request body fields:**

| Field | Type | Required |
|---|---|---|
| `name` | String | Yes |
| `price` | Number | Yes |
| `category` | String | Yes |
| `restaurantId` | String (ObjectId or name) | Yes |
| `description` | String | No |
| `image` | File (multipart) | No |

---

#### `getAllFoods` — Read All Food Items

**Route:** `GET /api/food/`  
**Access:** Public (no authentication required)

Processing steps:

1. Queries the `foods` collection for all documents.
2. Populates the `restaurantId` field with the corresponding Restaurant document (`name`, `address`, `logo` fields).
3. Returns the array of populated food documents with status `200`.

This endpoint is consumed by the HomeScreen, RestaurantDetailScreen, and any other screen that displays food listings.

---

#### `updateFood` — Update a Food Item

**Route:** `PUT /api/food/:id`  
**Access:** Manager only

Processing steps:

1. Reads the food item `id` from `req.params.id`.
2. Finds the existing document. Returns `404` if not found.
3. If a new `restaurantId` is provided, calls `resolveRestaurantId()` to validate it.
4. Updates all provided fields. If `req.file` is present, replaces the image path with the new Cloudinary URL.
5. Saves and returns the updated document with status `200`.

---

#### `deleteFood` — Delete a Food Item

**Route:** `DELETE /api/food/:id`  
**Access:** Manager only

Processing steps:

1. Reads the food item `id` from `req.params.id`.
2. Finds and deletes the document using `findByIdAndDelete()`.
3. Returns `404` if the item does not exist.
4. Returns a success message with status `200` on successful deletion.

---

### 3.3 Food Routes

**File:** `backend/routes/foodRoutes.js`

Defines the Express Router configuration for all food-related API paths. This file also defines the `onlyManager` inline middleware.

**Mounted in server.js at:** `app.use('/api/food', foodRoutes)`

#### `onlyManager` Middleware

Checks `req.user.role` after the `protect` middleware has verified the JWT and attached `req.user`. If the role is not `'manager'`, it returns a `403 Forbidden` response immediately. Customers and Riders are blocked by this check.

```
if (req.user && req.user.role === 'manager') → next()
else → 403 { message: 'Access restricted to Managers only.' }
```

#### Route Definitions

| Method | Path | Middleware | Controller |
|---|---|---|---|
| POST | `/api/food/add` | protect, onlyManager, cloudinaryUpload.single('image') | addFood |
| POST | `/api/food/` | protect, onlyManager, cloudinaryUpload.single('image') | addFood |
| GET | `/api/food/` | (none) | getAllFoods |
| PUT | `/api/food/:id` | protect, onlyManager, cloudinaryUpload.single('image') | updateFood |
| DELETE | `/api/food/:id` | protect, onlyManager | deleteFood |

The second POST route at `/api/food/` is a backward-compatibility alias for older API calls and maps to the same `addFood` controller function.

---

### 3.4 Food Upload Middleware

**File:** `backend/middleware/foodUploadMiddleware.js`

Configures Multer for local disk storage of food images during development. In the production deployment on Render, `cloudinaryConfig.js` is used instead.

**Storage target:** `<project-root>/uploads/`  
**Filename format:** `food-<timestamp>.<extension>`  
**Maximum file size:** 2,000,000 bytes (2 MB)  
**Allowed file types:** `jpeg`, `jpg`, `png` (validated by both file extension and MIME type)

The `uploads/` directory is created automatically at startup if it does not already exist, using `fs.mkdirSync` with `{ recursive: true }`.

---

## 4. Frontend Screens

### 4.1 AddFoodScreen

**File:** `frontend/src/components/js/AddFoodScreen.js`  
**Route:** `/add-food`  
**Access:** Manager only (enforced at backend; warning displayed on frontend if role mismatch)

This screen provides a form for a Manager to create a new food item. It handles restaurant selection, category selection, image picking, form validation, and submission.

#### State Variables

| Variable | Purpose |
|---|---|
| `name` | Food item name text input value |
| `price` | Price text input value |
| `description` | Description text input value |
| `category` | Currently selected category (default: 'Burger') |
| `imageUri` | Local URI of the photo selected from gallery |
| `categoryModal` | Boolean controlling category picker modal visibility |
| `submitting` | Boolean controlling submit button loading state |
| `errorMsg` | String holding the current error message to display |
| `restaurants` | Array of restaurant objects fetched from the API |
| `restaurantId` | `_id` of the selected restaurant |
| `isDropdownOpen` | Boolean controlling custom restaurant dropdown visibility |
| `loadingRestaurants` | Boolean controlling restaurant loading spinner |
| `isManager` | Boolean indicating if the current user is a Manager |

#### Key Functions

**`fetchRestaurants()`**  
Calls `GET /api/restaurants` on component mount. Normalizes the response via `normalizeRestaurantsResponse()` which handles three possible response shapes: plain array, `{ data: [] }`, or `{ restaurants: [] }`. Filters out any rows with invalid `_id` values before saving to state.

**`pickFoodImage()`**  
Requests media library permission via `expo-image-picker`. Opens the gallery with `allowsEditing: true` and a 4:3 aspect ratio. Stores the selected image's local URI in `imageUri` state.

**`handleSubmit()`**  
Validates all form fields, builds a `FormData` object, and sends a `POST` request to `/api/food/add`.

Validation rules enforced before submission:

- `name` must not be empty after trimming whitespace.
- `price` must not be empty.
- `category` must be selected.
- `price` must convert to a valid number greater than zero (`Number.isNaN` check).
- At least one restaurant must exist in the fetched list.
- A restaurant must be selected from the dropdown.

FormData fields sent:

| Field | Source |
|---|---|
| `name` | Trimmed text input |
| `description` | Trimmed text input |
| `price` | Converted to string |
| `category` | Selected category value |
| `restaurantId` | Selected restaurant `_id` |
| `image` | File object `{ uri, name, type }` — only appended if an image was picked |

The `Authorization: Bearer <token>` header is added using the JWT retrieved from AsyncStorage via `getToken()`. `Content-Type` is not set manually; the `fetch` API sets the correct `multipart/form-data` boundary automatically when the body is a `FormData` object.

#### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `embedded` | Boolean | false | When `true`, hides the header row (used when embedded inside ManagerDashboardScreen Tab 4) |

---

### 4.2 EditFoodScreen

**File:** `frontend/src/components/js/EditFoodScreen.js`  
**Route:** `/edit-food`  
**Access:** Manager only

This screen pre-fills a form with existing food item data passed via Expo Router navigation params and allows a Manager to update any field and optionally replace the food image.

#### Navigation Params Received

| Param | Description |
|---|---|
| `id` | MongoDB `_id` of the food item |
| `name` | Current food name |
| `price` | Current price |
| `description` | Current description |
| `category` | Current category |
| `image` | Current image path or URL |
| `restaurantId` | Current restaurant `_id` |

#### Key Differences from AddFoodScreen

- Uses `useLocalSearchParams()` to read existing food data and pre-fill all fields.
- Uses `useMemo` to compute the full image URL from `existingImagePath` without recalculating on every render.
- Maintains separate state for `existingImagePath` (server image) and `newImageUri` (locally picked replacement). If `newImageUri` is null, the existing server image is displayed and retained on save.
- Uses `@react-native-picker/picker` native `Picker` component for restaurant selection (instead of the custom dropdown used in AddFoodScreen).
- Sends a `PUT /api/food/:id` request instead of POST.
- Displays a fallback error screen if the screen is opened without a valid `foodId` param.

**`handleSubmit()`** in this screen applies the same validation rules as AddFoodScreen. On success, it navigates to the `/home` route.

---

### 4.3 FoodDetailScreen

**File:** `frontend/src/components/js/FoodDetailScreen.js`  
**Route:** `/food-detail`  
**Access:** All users (read-only)

This is a display-only screen that shows the full details of a single food item. It does not make any API calls; all data is received via navigation params passed from RestaurantDetailScreen.

#### Data Displayed

| Param | Displayed As |
|---|---|
| `name` | Large title text |
| `price` | Formatted as "LKR {price}" |
| `category` | Category badge |
| `description` | Body text (only rendered if non-empty) |
| `image` | Full-width hero image at top of screen |
| `restaurantName` | Row with storefront icon (only rendered if non-empty) |

**Image URL construction:** If `foodImage` starts with `http`, it is used directly. Otherwise, it is prefixed with `SERVER_URL + '/'` to form the complete URL. If no image path is present, a placeholder icon is displayed.

This screen serves as the entry point for the Member 6 (Reviews) integration. The reviews section for this food item is rendered below the food details.

---

### 4.4 RestaurantDetailScreen

**File:** `frontend/src/components/js/RestaurantDetailScreen.js`  
**Route:** `/restaurant-detail`  
**Access:** All users (role-dependent features)

This screen implements a master-detail pattern. The restaurant information (from Member 2) is shown at the top as a hero section, and the filtered food item list (from Member 3) is shown below. It is the primary screen where customers interact with food items.

#### Data Loading

Calls `GET /api/food` (all foods) on mount. Filters the result array on the frontend by comparing `food.restaurantId._id` or `food.restaurantId` against the `restId` param. This avoids the need for a separate filtered endpoint.

#### Role-Based UI

| User Role | Food Card UI |
|---|---|
| Customer | "Add to Cart" button per card |
| Manager | Edit icon and Delete icon per card; "View" label instead of Add to Cart |

#### `handleAddToCart(item)`

1. Retrieves the current cart array from AsyncStorage using `getCart()`.
2. Searches for an existing entry with the same `foodId`.
3. If found, increments `quantity` by 1.
4. If not found, pushes a new object `{ foodId, name, price, image, restaurantId, quantity: 1 }`.
5. Saves the updated cart back to AsyncStorage using `saveCart()`.

#### `handleEditFood(item)`

Navigates to `/edit-food` with the food item's current data as params. Normalises `restaurantId` from either an ObjectId string or a populated object.

#### `handleDeleteFood(item)`

Shows a confirmation `Alert.alert` dialog. On confirmation, calls `DELETE /api/food/:id` with the Manager's JWT token. On success, filters the deleted item out of local `foods` state immediately (no re-fetch required).

#### List Rendering

Uses a `FlatList` with `ListHeaderComponent` for the restaurant hero section so that the entire screen scrolls as a single list, avoiding nested scroll issues. The `ListEmptyComponent` shows a message when no food items are available.

---

## 5. Route Wrapper Files

These files are thin Expo Router page entry points. Each file imports and re-exports the corresponding screen component to register it as a navigable URL route. They contain no additional logic.

| File | Route Registered | Screen Component |
|---|---|---|
| `app/(tabs)/add-food.js` | `/add-food` | AddFoodScreen |
| `app/(tabs)/edit-food.js` | `/edit-food` | EditFoodScreen |
| `app/(tabs)/food-detail.js` | `/food-detail` | FoodDetailScreen |
| `app/(tabs)/restaurant-detail.js` | `/restaurant-detail` | RestaurantDetailScreen |

All four routes use `href: null` in the Expo Router tab configuration, meaning they do not appear as visible tabs in the bottom navigation bar. They are accessed only via programmatic navigation (`router.push()`).

---

## 6. Stylesheet Files

| File | Used By |
|---|---|
| `AddFoodScreenStyles.js` | AddFoodScreen, EditFoodScreen |
| `FoodDetailScreenStyles.js` | FoodDetailScreen |
| `RestaurantDetailScreenStyles.js` | RestaurantDetailScreen |

All stylesheets export a default `styles` object and a named `COLORS` constant. The color palette follows the app's dark theme. Key color tokens:

| Token | Usage |
|---|---|
| `COLORS.background` | Screen and container backgrounds |
| `COLORS.accent` | Buttons, icons, selected states |
| `COLORS.textPrimary` | Main readable text |
| `COLORS.textSecondary` | Placeholder text, subtitles |
| `COLORS.error` | Validation error messages, delete icons |

---

## 7. API Reference

All endpoints are prefixed with `/api/food` as mounted in `server.js`.

### POST `/api/food/add`

Creates a new food item.

**Headers:** `Authorization: Bearer <token>`  
**Body:** `multipart/form-data`

| Field | Type | Required |
|---|---|---|
| name | string | Yes |
| price | number | Yes |
| category | string | Yes |
| restaurantId | string | Yes |
| description | string | No |
| image | file | No |

**Response 201:**
```json
{
  "_id": "...",
  "name": "Cheese Burger",
  "price": 850,
  "category": "Burger",
  "restaurantId": "...",
  "image": "https://res.cloudinary.com/..."
}
```

**Response 400:** Missing required fields or restaurant not found.  
**Response 403:** User is not a Manager.  
**Response 401:** JWT token missing or invalid.

---

### GET `/api/food/`

Returns all food items with restaurant details populated.

**Headers:** None required.

**Response 200:**
```json
[
  {
    "_id": "...",
    "name": "Cheese Burger",
    "price": 850,
    "category": "Burger",
    "image": "...",
    "restaurantId": {
      "_id": "...",
      "name": "Burger Palace",
      "address": "Colombo 03"
    }
  }
]
```

---

### PUT `/api/food/:id`

Updates an existing food item by its MongoDB `_id`.

**Headers:** `Authorization: Bearer <token>`  
**Body:** `multipart/form-data` (same fields as POST; all optional)

**Response 200:** Updated food document.  
**Response 404:** Food item not found.  
**Response 403:** User is not a Manager.

---

### DELETE `/api/food/:id`

Deletes a food item by its MongoDB `_id`.

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{ "message": "Food item deleted successfully." }
```

**Response 404:** Food item not found.  
**Response 403:** User is not a Manager.

---

## 8. Middleware Chain

The full middleware chain for protected write operations is as follows:

```
Request
   |
   v
protect (authMiddleware.js)
   |  Verifies JWT from Authorization header
   |  Attaches req.user = { id, role, ... }
   |  Returns 401 if token is missing or invalid
   v
onlyManager (foodRoutes.js)
   |  Checks req.user.role === 'manager'
   |  Returns 403 if role is Customer or Rider
   v
cloudinaryUpload.single('image') (cloudinaryConfig.js)
   |  Processes multipart/form-data
   |  Uploads image to Cloudinary if present
   |  Attaches req.file with Cloudinary URL
   v
Controller Function (foodController.js)
   |  Executes CRUD logic
   v
MongoDB
```

---

## 9. Role-Based Access Control

| Operation | Customer | Rider | Manager |
|---|---|---|---|
| View all food items (GET) | Allowed | Allowed | Allowed |
| View food item details | Allowed | Allowed | Allowed |
| Add to cart | Allowed | Not applicable | Not shown |
| Create food item (POST) | Blocked (403) | Blocked (403) | Allowed |
| Update food item (PUT) | Blocked (403) | Blocked (403) | Allowed |
| Delete food item (DELETE) | Blocked (403) | Blocked (403) | Allowed |

---

## 10. Integration with Other Components

### Member 2 — Restaurants

Every food item has a `restaurantId` field that is a foreign key reference to the `Restaurant` collection. The food controller validates this reference using `resolveRestaurantId()` before saving. The `getAllFoods` endpoint populates restaurant data into each food object. The `RestaurantDetailScreen` receives restaurant data from Member 2's screens and uses `restaurantId` to filter food items displayed.

### Member 4 — Cart and Orders

The `RestaurantDetailScreen` adds food items to the customer's cart stored in AsyncStorage. Each cart entry contains `foodId`, `name`, `price`, `image`, `restaurantId`, and `quantity`. The `Order` model (Member 4) references food items via `items[].foodId`, creating a link from placed orders back to the food item records managed by this component.

### Member 6 — Reviews

The `Review` model contains an optional `foodId` field allowing reviews to be linked to specific food items. The `FoodDetailScreen` is the screen where food-level reviews are displayed. Member 6 renders the review list and average star rating below the food details section on that screen.

---

## 11. Shared Dependencies

| File | Used By This Component For |
|---|---|
| `backend/config/cloudinaryConfig.js` | Provides `cloudinaryUpload` Multer instance used in foodRoutes.js for image uploads |
| `backend/middleware/authMiddleware.js` | Provides `protect` middleware used to verify JWT on all write routes |
| `backend/server.js` | Mounts food routes at `/api/food` and serves `uploads/` as static files |
| `frontend/src/config.js` | Provides `API_BASE_URL` and `SERVER_URL` used in all fetch calls and image URL construction |
| `frontend/src/utils/storage.js` | Provides `getToken()`, `getUser()`, `getCart()`, `saveCart()` used across screens |

---

## 12. Configuration

### Backend Server Address

**File:** `frontend/src/config.js`

```js
export const API_BASE_URL = 'https://quickbite-app-1rdg.onrender.com/api';
export const SERVER_URL = API_BASE_URL.replace(/\/api\/?$/, '');
// Result: 'https://quickbite-app-1rdg.onrender.com'
```

`API_BASE_URL` is used as the base for all `fetch()` calls. `SERVER_URL` is used to construct full image URLs from relative paths stored in the database (e.g., `SERVER_URL + '/' + food.image`).

---

## 13. Technologies Used

| Layer | Technology | Purpose |
|---|---|---|
| Frontend framework | React Native (Expo SDK 54) | Cross-platform mobile UI |
| Navigation | Expo Router | File-based routing and screen navigation |
| State management | React Hooks (useState, useEffect, useMemo) | Local component state |
| Image selection | expo-image-picker | Gallery access for food photo uploads |
| Local persistence | AsyncStorage (via storage.js) | Cart data storage |
| HTTP client | fetch API | API calls from frontend to backend |
| Backend runtime | Node.js | Server-side JavaScript execution |
| Web framework | Express.js | REST API routing and middleware |
| Database | MongoDB | Document storage for food items |
| ODM | Mongoose | Schema definition and database queries |
| Image storage (dev) | Local disk via Multer | File upload handling in development |
| Image storage (prod) | Cloudinary via Multer-Cloudinary | Cloud image hosting in production |
| Authentication | JWT (JSON Web Tokens) | Stateless user authentication |
| Icons | Ionicons (expo/vector-icons) | UI icon set |

---

*QuickBite App — Food Component Documentation*  
*Member 3*
