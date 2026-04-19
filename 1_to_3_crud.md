# QuickBite — Members 1, 2 & 3 CRUD (Code-Accurate)

**Project root:** `QuickBite_App/`  
**Backend:** `backend/`  
**Frontend:** `frontend/`

**API base URL:** `frontend/src/config.js` — `API_BASE_URL` (phone test karanna PC IP eka hondatama danna).

**Important:** App eke API calls okkoma **`fetch`** use karanawa — **Axios naha**. Login screen eke thiyena widihata error handling + JSON read karanawa.

---

## Member 1 — User (Auth & Profile)

**Backend logic okkoma:** `backend/controllers/authController.js` (register, login, profile, update, delete, profile-pic).  
**Routes:** `backend/routes/authRoutes.js` — URLs `/api/auth/...` me file eken controller ekata map wenawa.

| Operation | CRUD Type | Backend File | Frontend File |
|-----------|-----------|--------------|----------------|
| Register (new account) | **Create** | `backend/controllers/authController.js` | `frontend/src/components/js/RegisterScreen.js` |
| Login (JWT + user object) | **Read** (session / identity) | `backend/controllers/authController.js` | `frontend/src/components/js/LoginScreen.js` |
| Load my profile | **Read** | `backend/controllers/authController.js` | `frontend/src/components/js/ProfileScreen.js` |
| Edit name / email / phone | **Update** | `backend/controllers/authController.js` | `frontend/src/components/js/ProfileScreen.js` |
| Upload profile photo | **Update** | `backend/controllers/authController.js` | `frontend/src/components/js/ProfileScreen.js` |
| Delete my account | **Delete** | `backend/controllers/authController.js` | `frontend/src/components/js/ProfileScreen.js` |

**Tab entry (Profile tab):** `frontend/app/(tabs)/profile.js` — meka `ProfileScreen` load karanawa.

### Register (Create)

Step 1: User `RegisterScreen` eke name, email, password, phone, role fill karanawa.  
Step 2: Button eka press unama validation run wenawa — empty fields, email eke `@` thiyenawada, password length, confirm match, phone digits wage.  
Step 3: Frontend eken **`fetch`** eken `POST` request eka yawanawa — URL eka `API_BASE_URL + '/auth/register'` (full path eken `/api/auth/register`). Body eka JSON — `JSON.stringify({ name, email, password, role, phone })`.  
Step 4: Backend eke `authController.register` MongoDB ekata user ekak save karanawa — password eka hash wela thiyenawa.  
Step 5: Response OK nam success message + Alert; user login screen ekata `router.replace` karanawa.

### Login (Read — token + user)

Step 1: User email saha password type karanawa `LoginScreen` eke.  
Step 2: Simple validation — fields fill, email eke `@` thiyenawada.  
Step 3: **`fetch(loginUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })`** — data Backend ekta yawanawa.  
Step 4: Response body eka safe widihata read karanawa — text aragena JSON parse (HTML error page awoth crash nawaththanna).  
Step 5: `response.ok` naththam server message eka pennanawa.  
Step 6: Success nam `saveToken(data.token)` saha `saveUser(data.user)` — `storage.js` eken AsyncStorage ekata save wenawa.  
Step 7: Role eka balagena `router.replace` — manager nam dashboard path, rider/customer nam home path.

### Load profile (Read)

Step 1: `ProfileScreen` mount unama `useEffect` eken `fetchProfile` call wenawa.  
Step 2: `getToken()` eken JWT gannawa — naththam login ekata redirect.  
Step 3: **`fetch(API_BASE_URL + '/auth/profile', { method: 'GET', headers: { Authorization: 'Bearer ' + token } })`**.  
Step 4: Backend eke `protect` middleware JWT verify kara `req.user` set karanawa; `getProfile` DB eken user eka return karanawa.  
Step 5: JSON eka `setUser(data)` eken screen eke pennanawa. 401 awoth token clear kara login ekata yawanawa.

### Edit profile text (Update)

Step 1: User edit modal eke name, email, phone change karanawa.  
Step 2: Save press unama validation — name/email required, phone thibboth 10 digits.  
Step 3: **`fetch(...'/auth/update', { method: 'PUT', Authorization: Bearer, body: JSON.stringify({ name, email, phone }) })`**.  
Step 4: Backend `updateUser` DB eka update kara updated user return karanawa.  
Step 5: Frontend `setUser` + `saveUser` — cache eka hondatama thiyagannawa.

### Upload profile photo (Update)

Step 1: User photo ekak pick karanawa — `expo-image-picker` eken gallery.  
Step 2: `FormData` hadanawa; field name **`image`** — meka Multer `upload.single('image')` ekata match.  
Step 3: **`fetch(...'/auth/profile-pic', { method: 'PUT', headers: { Authorization only }, body: formData })`** — `Content-Type` manual danna epa (boundary auto).  
Step 4: Backend file eka `uploads/` walata save kara path eka user document eke save karanawa.  
Step 5: Return wena `data.user` eken UI + AsyncStorage update karanawa.

### Delete account (Delete)

Step 1: User dangerous action eka confirm karanawa — Alert dialog.  
Step 2: **`fetch(...'/auth/delete', { method: 'DELETE', Authorization: Bearer })`**.  
Step 3: Backend user record eka remove karanawa (implementation controller eke).  
Step 4: Success nam `clearAll()` kara register screen ekata yawanawa.

---

## Member 2 — Restaurant

**Backend logic okkoma:** `backend/controllers/restaurantController.js`.  
**Routes:** `backend/routes/restaurantRoutes.js` — base path `/api/restaurants`. Manager write operations walata JWT + `onlyManager` + optional Multer (`logo` field).

| Operation | CRUD Type | Backend File | Frontend File |
|-----------|-----------|--------------|----------------|
| Add new restaurant (+ optional logo) | **Create** | `backend/controllers/restaurantController.js` | `frontend/src/components/js/AddRestaurantScreen.js` |
| List all restaurants (public) | **Read** | `backend/controllers/restaurantController.js` | `frontend/src/components/js/AddRestaurantScreen.js` |
| List all restaurants (public) | **Read** | `backend/controllers/restaurantController.js` | `frontend/src/components/js/ManageRestaurantsScreen.js` |
| List all restaurants (dropdown) | **Read** | `backend/controllers/restaurantController.js` | `frontend/src/components/js/AddFoodScreen.js` |
| List all restaurants (dropdown) | **Read** | `backend/controllers/restaurantController.js` | `frontend/src/components/js/EditFoodScreen.js` |
| List all restaurants (customer Home) | **Read** | `backend/controllers/restaurantController.js` | `frontend/app/(tabs)/home.js` → `frontend/src/components/js/HomeScreen.js` |
| Update restaurant (inline form) | **Update** | `backend/controllers/restaurantController.js` | `frontend/src/components/js/AddRestaurantScreen.js` |
| Update restaurant (full page) | **Update** | `backend/controllers/restaurantController.js` | `frontend/src/components/js/EditRestaurantScreen.js` |
| Delete restaurant | **Delete** | `backend/controllers/restaurantController.js` | `frontend/src/components/js/AddRestaurantScreen.js` |
| Delete restaurant | **Delete** | `backend/controllers/restaurantController.js` | `frontend/src/components/js/ManageRestaurantsScreen.js` |
| Get one restaurant by ID (REST API) | **Read** | `backend/controllers/restaurantController.js` | *App eke me URL eka direct `fetch` karanne na; detail/edit eken data pass wenawa navigation params walin (`RestaurantDetailScreen`, `EditRestaurantScreen`).* |

**Tab / hidden routes:** `frontend/app/(tabs)/add-restaurant.js`, `manage-restaurants.js`, `edit-restaurant.js`.

### Add restaurant (Create)

Step 1: Manager `AddRestaurantScreen` eke name, address, working hours fill karanawa; optional logo pick karanawa.  
Step 2: Submit press — token `getToken()` eken gannawa; naththam login ekata send karanawa.  
Step 3: `FormData` eken text fields append; logo thibboth field name **`logo`** — Multer ekata match.  
Step 4: **`fetch(API_BASE_URL + '/restaurants', { method: 'POST', Authorization: Bearer, body: formData })`**.  
Step 5: Backend `createRestaurant` DB ekata document ekak save karanawa.  
Step 6: Success nam list eka `loadRestaurants()` eken refresh karanawa.

### List restaurants (Read)

Step 1: **`fetch(API_BASE_URL + '/restaurants')`** — method GET default; JWT optional naha (public).  
Step 2: JSON array eka `setRestaurants` / UI eke pennanawa.  
Step 3: `AddRestaurantScreen` eke `useFocusEffect` eken screen focus weddi list refresh wenawa — alut restaurant add unath pennenne.

### Update restaurant (Update)

**Option A — same screen (AddRestaurantScreen):**  
Step 1: List eken “Edit” press kara `editingId` set karanawa; form eke fields fill wenawa.  
Step 2: Submit eken **`fetch(API_BASE_URL + '/restaurants/' + editingId, { method: 'PUT', Authorization, body: formData })`**.  
Step 3: Backend `updateRestaurant` document eka update karanawa; optional new logo.

**Option B — EditRestaurantScreen:**  
Step 1: Navigation params eken id, name, address, hours, logo path gannawa — **GET `/restaurants/:id` call eka me screen eke naha**.  
Step 2: User changes save karanawa — same `PUT` + FormData + Bearer pattern.  
Step 3: Backend same `updateRestaurant` controller.

### Delete restaurant (Delete)

Step 1: User delete confirm karanawa — Alert.  
Step 2: **`fetch(API_BASE_URL + '/restaurants/' + item._id, { method: 'DELETE', Authorization: Bearer })`**.  
Step 3: Backend eka linked **Food** documents thiyenawada check karanawa — thibboth delete block karanawa (data break wena eka nawaththanna).  
Step 4: OK nam local list eken item eka remove karanawa.

### Get one restaurant by ID (Read — API only)

Step 1: Route `GET /api/restaurants/:id` backend eke `getRestaurantById` — **mobile app eke me endpoint eka use karanne na** me project eke.  
Step 2: Customer restaurant detail eke header tika Home eken **router params** widinna enawa; manager edit ekenuth params use karanawa.

---

## Member 3 — Food (Menu)

**Backend logic okkoma:** `backend/controllers/foodController.js`.  
**Routes:** `backend/routes/foodRoutes.js` — base `/api/food`. Create/Update walata field **`image`** (Multer). Manager-only: `protect` + `onlyManager`.

| Operation | CRUD Type | Backend File | Frontend File |
|-----------|-----------|--------------|----------------|
| Add food item (+ restaurant link + image) | **Create** | `backend/controllers/foodController.js` | `frontend/src/components/js/AddFoodScreen.js` |
| List all foods (then filter by restaurant) | **Read** | `backend/controllers/foodController.js` | `frontend/src/components/js/RestaurantDetailScreen.js` |
| View food details (name, price, image, etc.) | **Read** (UI only — no new API) | *Data already in memory / navigation params* | `frontend/src/components/js/FoodDetailScreen.js` |
| Update food item | **Update** | `backend/controllers/foodController.js` | `frontend/src/components/js/EditFoodScreen.js` |
| Delete food item | **Delete** | `backend/controllers/foodController.js` | `frontend/src/components/js/RestaurantDetailScreen.js` |

**Tab routes:** `frontend/app/(tabs)/add-food.js`, `food-detail.js`, `edit-food.js`, `restaurant-detail.js`.

**Note:** Backend eke **`GET /api/food/:id`** route **naha** — `foodRoutes.js` eke list witharak thiyenne. Edit screen eke food details **Home / RestaurantDetail eken pass karana params** eken form fill wenawa.

### Add food (Create)

Step 1: Manager `AddFoodScreen` eke name, price, description, category, restaurant (custom dropdown) select karanawa.  
Step 2: Optional image pick — FormData eken **`image`** field.  
Step 3: **`fetch(API_BASE_URL + '/food/add', { method: 'POST', Authorization: Bearer, body: formData })`**.  
Step 4: Body eke `restaurantId` thiyenawa — food eka correct restaurant ekata link wenawa (Member 2 schema reference).  
Step 5: Backend `addFood` validate kara MongoDB ekata save karanawa.

### List / filter foods for one restaurant (Read)

Step 1: User Home eken restaurant ekak tap kara `RestaurantDetailScreen` ekata enawa — restaurant id params walin enawa.  
Step 2: **`fetch(API_BASE_URL + '/food')`** — okkoma foods JSON eka enawa.  
Step 3: Frontend eke `filter` eken **`String(food.restaurantId)`** match kara **selected restaurant id** ekata — e kade menu witharak pennanawa.  
Step 4: Loading / empty states UI eke handle karanawa.

### View food detail (Read — client-side)

Step 1: Menu eken item ekak tap kara `FoodDetailScreen` ekata `router.push` — name, price, image path, description params widinna yawanawa.  
Step 2: Me screen eke **alut `fetch` eka food item ekata naha** — params + `SERVER_URL` eken image URL hadanawa.  
Step 3: Reviews thiyenam aluth tab eken handle karanawa (Member 4 area).

### Update food (Update)

Step 1: Manager Restaurant Detail eken “Edit” → `EditFoodScreen` — params eken food id saha fields pre-fill.  
Step 2: Restaurant list eken dropdown update karanna `GET /restaurants` eken list gannawa (Member 2 read).  
Step 3: **`fetch(API_BASE_URL + '/food/' + foodId, { method: 'PUT', Authorization: Bearer, body: formData })`** — text + optional new `image`.  
Step 4: Backend `updateFood` document eka update karanawa.

### Delete food (Delete)

Step 1: Manager `RestaurantDetailScreen` eke food item ekak delete press karanawa — Alert confirm.  
Step 2: **`fetch(API_BASE_URL + '/food/' + item._id, { method: 'DELETE', Authorization: Bearer })`**.  
Step 3: Backend `deleteFood` record eka ain karanawa.  
Step 4: Success nam local `foods` state eken item eka filter kara remove karanawa — list eke witharak update wenawa.

---

## Quick cheat sheet (open these first)

| Member | Backend | Frontend |
|--------|---------|----------|
| **1** | `backend/controllers/authController.js` | `LoginScreen.js` → `RegisterScreen.js` → `ProfileScreen.js` |
| **2** | `backend/controllers/restaurantController.js` | `AddRestaurantScreen.js` |
| **3** | `backend/controllers/foodController.js` | `RestaurantDetailScreen.js` → `AddFoodScreen.js` → `EditFoodScreen.js` |

---

*Paths `frontend/...` laga `QuickBite_App` folder eke relative. `home.js` imports `HomeScreen.js` — component file eka project eke thiyenawa nam me path eke thiyenna ona (`frontend/src/components/js/HomeScreen.js`).*
