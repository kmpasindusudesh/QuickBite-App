// =====================================================
// add-restaurant.js — Add Restaurant Tab Screen (Expo Router wrapper)
// Member 2: Manager — Aluth restaurant add karanawa
//
// Actual logic: src/components/js/AddRestaurantScreen.js
//
// Features:
//   - Restaurant name, address, workingHours inputs
//   - Logo image upload (ImagePicker → FormData)
//   - POST /api/restaurants (JWT + Manager only)
//
// Navigation:
//   Manager Dashboard Tab 1 "My Restaurants" → AddRestaurantScreen embedded
//   Tab visibility: href: null (tab bar eke pennawa naha — Dashboard embedded)
// =====================================================
import AddRestaurantScreen from '../../src/components/js/AddRestaurantScreen';
export default AddRestaurantScreen;
