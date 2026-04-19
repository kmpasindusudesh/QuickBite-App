// =====================================================
// manager-dashboard.js — Manager Dashboard Tab (Expo Router wrapper)
// Member 4 (Orders) + Member 2 (Restaurants) + Member 6 (Reviews) + Member 3 (Food) integration
//
// Actual logic: src/components/js/ManagerDashboardScreen.js
//
// This screen is the Manager's "command center" with 4 inner tabs:
//   Tab 1 — My Restaurants (Member 2)
//             AddRestaurantScreen embedded; restaurant CRUD
//   Tab 2 — Manage Orders (Member 4)
//             GET /api/orders (all); Accept & Prepare → Preparing; Mark as Ready → Ready
//   Tab 3 — Customer Reviews (Member 6)
//             GET /api/reviews; delete moderation
//   Tab 4 — Add Food (Member 3)
//             AddFoodScreen embedded
//
// Tab visibility: href: null → only accessible from Profile screen
// (Manager eke tab bar eke pennawa naha — Profile → "Manager Dashboard" button)
// =====================================================
import ManagerDashboardScreen from '../../src/components/js/ManagerDashboardScreen';
export default ManagerDashboardScreen;
