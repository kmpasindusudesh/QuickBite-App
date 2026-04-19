// =====================================================
// home.js — Home Tab Screen (Expo Router wrapper)
// This file is the tab entry point; actual logic is in HomeScreen component
//
// Expo Router pattern:
//   app/(tabs)/home.js = route file
//   src/components/js/HomeScreen.js = actual component
//   Wrapper pattern — routes clean; logic components eke
//
// Members using Home:
//   Member 2 → Restaurants list pennawa (getAllRestaurants)
//   Member 3 → Food items pennawa (getAllFoods); filter by restaurant
//   Member 4 → Customer ta "Add to Cart" button (food item cards)
//   Manager → Food edit/delete + Restaurant manage eke navigate
// =====================================================
import HomeScreen from '../../src/components/js/HomeScreen';
export default HomeScreen;
