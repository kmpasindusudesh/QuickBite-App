// =====================================================
// storage.js — Utility: AsyncStorage Helper Functions
// Phone eke local storage ekata data save / read / clear karanawa
//
// AsyncStorage = React Native eke persistent key-value storage
// Phone off unath data thiyenawa (unlike React state)
//
// Me file use karana thena:
//   LoginScreen    → saveToken() + saveUser()   (login success)
//   Every API call → getToken()                  (Authorization header)
//   ProfileScreen  → getUser()                   (offline display)
//   LogoutScreen   → clearAll()                  (session end)
//   CartScreen     → getCart() / saveCart() / clearCart()
//
// All 6 Members me storage.js use karanawa API calls walata
// =====================================================

// AsyncStorage — React Native persistent storage library
import AsyncStorage from '@react-native-async-storage/async-storage';

// =====================================================
// Storage Keys — Constants
// Typo avoid karanawa hama thenaka same key string use wenawa
// =====================================================
const TOKEN_KEY  = 'quickbite_token'; // JWT token save karana key
const USER_KEY   = 'quickbite_user';  // User object JSON save karana key
const CART_KEY   = '@cart_items';     // Cart items array save karana key

// =====================================================
// saveToken — Member 1: Login success wenakotat JWT save karanawa
// token: string — backend eke JWT.sign() eken create karapu string
// Future API calls walata headers eke use karanawa: 'Bearer ' + token
// =====================================================
export const saveToken = async (token) => {
    try {
        // AsyncStorage.setItem(key, value) — string witharak save karanawa
        await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
        console.error('Token save weddi aulk:', error);
    }
};

// =====================================================
// getToken — Kalin save karapu JWT token gannawa
// Return: string hari null (token natha naththam)
// Use: API call walata Authorization header set karanawa
// Eg: headers: { Authorization: 'Bearer ' + token }
// =====================================================
export const getToken = async () => {
    try {
        // getItem null return karanawa naththam token naha
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        return token;
    } catch (error) {
        console.error('Token gannata aulk:', error);
        return null;
    }
};

// =====================================================
// saveUser — Login success wenakotat user data save karanawa
// userData: object { id, name, email, role, phone }
// Tab layout eke role check walata (_layout.js) + Profile screen display walata
// =====================================================
export const saveUser = async (userData) => {
    try {
        // Object JSON.stringify kara string ekata convert kara save — AsyncStorage strings only
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
    } catch (error) {
        console.error('User data save weddi aulk:', error);
    }
};

// =====================================================
// getUser — Save kara thiyana user object gannawa
// Return: object { id, name, email, role, ... } hari null
// _layout.js eke role gena tab bar configure karanawa
// =====================================================
export const getUser = async () => {
    try {
        const userData = await AsyncStorage.getItem(USER_KEY);
        // String eka JSON.parse → object ekata convert; naha naththam null
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('User data gannata aulk:', error);
        return null;
    }
};

// =====================================================
// clearAll — Logout karanawa; token + user data delete
// Login screen ekata redirect karanawa
// Cart clear wenawa nadda? Cart eka local nisa logout walata persist
// =====================================================
export const clearAll = async () => {
    try {
        // multiRemove — eka witagena multiple keys remove karanawa
        await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    } catch (error) {
        console.error('Clear weddi aulk:', error);
    }
};

// =====================================================
// CART HELPERS — Member 4: Customer Cart (Local Storage)
// Cart eka backend ekata naha — phone eke AsyncStorage ekata save
// Checkout walata cart eka FormData ekata convert kara backend yawanawa
//
// Cart item format:
// { foodId, name, price, image, restaurantId, quantity }
// =====================================================

// =====================================================
// getCart — @cart_items key eken items array gannawa
// Return: array of cart items hari [] (empty)
// cart.js screen focus wenawata meka call karanawa (useFocusEffect)
// =====================================================
export const getCart = async () => {
    try {
        const raw = await AsyncStorage.getItem(CART_KEY);
        // raw null naththam empty array return — crash prevent
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.error('Cart gannata aulk:', e);
        return [];
    }
};

// =====================================================
// saveCart — Cart state wenas wenakotat full array override kara save
// items: full cart array (quantity update / item add / remove kala passe)
// =====================================================
export const saveCart = async (items) => {
    try {
        await AsyncStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch (e) {
        console.error('Cart save weddi aulk:', e);
    }
};

// =====================================================
// clearCart — Checkout success una passe cart clear karanawa
// AsyncStorage.removeItem → key eka delete (setItem('[]') naha)
// =====================================================
export const clearCart = async () => {
    try {
        await AsyncStorage.removeItem(CART_KEY);
    } catch (e) {
        console.error('Cart clear weddi aulk:', e);
    }
};

/*
 * =====================================================
 * File mul sangrahaya — Viva reference
 * =====================================================
 * All Members use this file:
 *   Member 1 → saveToken/getToken/saveUser/getUser/clearAll (auth)
 *   Member 4 → getCart/saveCart/clearCart (cart + checkout)
 *
 * AsyncStorage:
 *   - Key-value store (string values only)
 *   - JSON.stringify → save object; JSON.parse → read back
 *   - Persistent across app restart + phone off
 *   - Async (Promise-based) → await use karanawa
 *
 * Token flow:
 *   Login → backend → JWT → saveToken() → AsyncStorage
 *   Any screen → getToken() → 'Bearer ' + token → API call headers
 *   Logout → clearAll() → AsyncStorage remove
 *
 * Cart flow:
 *   RestaurantDetailScreen → 'Add to Cart' → saveCart(updatedItems)
 *   CartScreen focus → getCart() → display + checkout
 *   Checkout success → clearCart()
 */
