// =====================================================
// edit-restaurant.js — Edit Restaurant Tab Screen (Expo Router wrapper)
// Member 2: Manager — Restaurant details wenas karanawa
//
// Actual logic: src/components/js/EditRestaurantScreen.js
//
// Features:
//   - Existing restaurant data load (GET /api/restaurants/:id)
//   - name, address, workingHours, logo edit
//   - PUT /api/restaurants/:id (JWT + Manager only; Multer optional logo)
//
// Navigation:
//   ManageRestaurantsScreen → "Edit" button → router.push('/edit-restaurant?id=...')
//   Tab visibility: href: null (tab bar eke pennawa naha)
// =====================================================
import EditRestaurantScreen from '../../src/components/js/EditRestaurantScreen';
export default EditRestaurantScreen;
