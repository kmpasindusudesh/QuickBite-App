// =====================================================
// food-detail.js — Food Detail Tab Screen (Expo Router wrapper)
// Member 3 + 6 integration
//
// Actual logic: src/components/js/FoodDetailScreen.js
//
// This screen shows:
//   Member 3 — Food item details (name, description, price, category, image)
//   Member 6 — Reviews for this food item
//              GET /api/reviews/food/:foodId → reviews + averageRating
//              Star rating display
//              Customer → navigate to ReviewScreen to add/edit review
//
// Navigation:
//   RestaurantDetailScreen → food item tap → router.push('/food-detail?id=...')
//   :id = food._id (URL search param)
//
// Tab visibility: href: null (tab bar eke pennawa naha; push eken access)
// =====================================================
import FoodDetailScreen from '../../src/components/js/FoodDetailScreen';
export default FoodDetailScreen;
