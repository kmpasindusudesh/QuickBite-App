// =====================================================
// restaurant-detail.js — Restaurant Detail Tab Screen (Expo Router wrapper)
// Member 2 + 3 + 4 integration
//
// Actual logic: src/components/js/RestaurantDetailScreen.js
//
// This screen shows:
//   Member 2 — Restaurant info (name, address, logo, workingHours)
//   Member 3 — Food items belonging to this restaurant (GET /api/food?restaurantId=...)
//   Member 4 — Customer: "Add to Cart" button per food item
//              → saveCart() (AsyncStorage update)
//   Manager  — food edit/delete navigation
//
// Navigation:
//   Home screen → restaurant card tap → router.push('/restaurant-detail?id=...')
//   :id = restaurant._id (URL search param)
//
// Tab visibility: href: null (tab bar eke pennawa naha; push eken access)
// =====================================================
import RestaurantDetailScreen from '../../src/components/js/RestaurantDetailScreen';
export default RestaurantDetailScreen;
