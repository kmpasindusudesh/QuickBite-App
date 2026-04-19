// =====================================================
// manage-restaurants.js — Manage Restaurants Tab Screen (Expo Router wrapper)
// Member 2: Manager — Restaurant list + delete management
//
// Actual logic: src/components/js/ManageRestaurantsScreen.js
//
// Features:
//   - All restaurants list (GET /api/restaurants)
//   - Edit navigate → /edit-restaurant?id=...
//   - Delete → DELETE /api/restaurants/:id (linked food check karanawa)
//
// Navigation:
//   Profile screen → "Manage Restaurants" → router.push('/manage-restaurants')
//   Tab visibility: href: null (tab bar eke pennawa naha)
// =====================================================
import ManageRestaurantsScreen from '../../src/components/js/ManageRestaurantsScreen';
export default ManageRestaurantsScreen;
