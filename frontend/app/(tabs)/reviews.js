// =====================================================
// reviews.js — Reviews Tab Screen (Expo Router wrapper)
// Member 6: Customer Reviews & Rating tab
//
// Actual logic: src/components/js/ReviewScreen.js
//
// Features (Member 6):
//   - Global review feed (GET /api/reviews)
//   - Add new review (POST /api/reviews; rating + comment + optional photo)
//   - Edit own review (PUT /api/reviews/:id)
//   - Delete own review (DELETE /api/reviews/:id)
//   - foodId optional — general app review hari food-specific review
//
// Tab visibility: Customer witharak (Manager + Rider hide — _layout.js)
// Manager → reviews Manager Dashboard eke manage karanawa (delete moderation)
// =====================================================
import ReviewScreen from '../../src/components/js/ReviewScreen';
export default ReviewScreen;
