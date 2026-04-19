// =====================================================
// add-food.js — Add Food Tab Screen (Expo Router wrapper)
// Member 3: Manager — New food item add karanawa
//
// Actual logic: src/components/js/AddFoodScreen.js
//
// Features:
//   - Food name, description, price, category inputs
//   - Restaurant dropdown (GET /api/restaurants → select)
//   - Food image upload (ImagePicker → FormData)
//   - POST /api/food/add (JWT + Manager only)
//
// Navigation:
//   Manager Dashboard Tab 4 "Add Food" → AddFoodScreen embedded
//   Tab visibility: href: null (tab bar eke pennawa naha — Dashboard embedded)
// =====================================================
import AddFoodScreen from '../../src/components/js/AddFoodScreen';
export default AddFoodScreen;
