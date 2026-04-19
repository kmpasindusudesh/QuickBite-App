// =====================================================
// profile.js — Profile Tab Screen (Expo Router wrapper)
// Member 1: User profile management tab
//
// Actual logic: src/components/js/ProfileScreen.js
//
// Features (Member 1):
//   - Profile info display (name, email, phone, photo)
//   - Edit profile (PUT /api/auth/update)
//   - Upload profile photo (PUT /api/auth/profile-pic)
//   - Change password
//   - Logout (clearAll + redirect)
//   - Delete account (DELETE /api/auth/delete)
//
// Manager only extras:
//   - "Manager Dashboard" button → /manager-dashboard navigate
//
// Tab visibility: All roles (Manager, Customer, Rider)
// =====================================================
import ProfileScreen from '../../src/components/js/ProfileScreen';
export default ProfileScreen;
