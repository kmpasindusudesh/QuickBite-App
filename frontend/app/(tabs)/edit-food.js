// =====================================================
// edit-food.js — Edit Food Tab Screen (Expo Router wrapper)
// Member 3: Manager — Food item edit karanawa
//
// Actual logic: src/components/js/EditFoodScreen.js
//
// Features:
//   - Existing food data load (GET /api/food/:id)
//   - name, description, price, category, image edit
//   - PUT /api/food/:id (JWT + Manager only; Multer optional image)
//
// Navigation:
//   Manager Dashboard → food card "Edit" button → router.push('/edit-food?id=...')
//   Tab visibility: href: null (tab bar eke pennawa naha)
// =====================================================
import EditFoodScreen from '../../src/components/js/EditFoodScreen';
export default EditFoodScreen;
