// =====================================================
// config.js — Frontend: API Configuration
// Backend server address eka define karanawa
//
// IMPORTANT: Me IP eka correct naththam okkoma API calls fail wenawa!
// Phone + Laptop eka same Wi-Fi network ekata thiyanama ona!
// =====================================================
//
// IP eka find karana widihata:
//   Step 1: Windows: Win+R → cmd → 'ipconfig' type karanna
//   Step 2: 'IPv4 Address' line eka balanna (eg: 192.168.1.XX)
//   Step 3: Me 192.168.1.7 eka oya ge correct IP ekata change karanna
//   Step 4: Backend server start wela thiyenawada check karanna (node server.js)
//
// Common errors:
//   - Restaurants naha / API 404 → wrong IP → ipconfig check
//   - Network error → backend not running → 'node server.js' start karanna
//   - Same network naha → phone hotspot use karanawa naththam IP change wenawa
// =====================================================

// API_BASE_URL — Backend eke /api prefix ekath ekka full URL
// Format: http://<your-IP>:5000/api
// Me URL eka okkoma fetch() calls walata use karanawa (storage.js + screens)
export const API_BASE_URL = 'https://quickbite-app-1rdg.onrender.com/api';

// =====================================================
// SERVER_URL — Static files serve karana base URL
// /api part eka remove → pure server root URL
//
// Use case: Image URL hadanawa
//   DB eke: 'uploads/filename.jpg' (relative path)
//   Frontend: SERVER_URL + '/' + imagePath → full image URL
//   Eg: 'http://192.168.1.7:5000/uploads/filename.jpg'
//
// Use karana thena:
//   Profile photo  → SERVER_URL + '/' + user.profilePic
//   Food image     → SERVER_URL + '/' + food.image
//   Restaurant logo → SERVER_URL + '/' + restaurant.logo
//   Review photo   → SERVER_URL + '/' + review.image
//   Delivery proof → SERVER_URL + '/' + delivery.deliveryProof
// =====================================================
export const SERVER_URL = API_BASE_URL.replace(/\/api\/?$/, '');
// Eg: 'http://192.168.1.7:5000/api' → 'http://192.168.1.7:5000'

/*
 * =====================================================
 * File mul sangrahaya — Viva reference
 * =====================================================
 * API_BASE_URL:
 *   'http://192.168.1.7:5000/api'
 *   All API calls: fetch(API_BASE_URL + '/auth/login', ...)
 *   Rider: fetch(API_BASE_URL + '/orders/available', ...)
 *
 * SERVER_URL:
 *   'http://192.168.1.7:5000'
 *   Images: <Image source={{ uri: SERVER_URL + '/' + imagePath }} />
 *
 * Me rende export karanawa — screens eke import wenawa:
 *   import { API_BASE_URL, SERVER_URL } from '../../src/config';
 *   (path: app/(tabs)/ → src/config.js)
 *
 * Deployment note:
 *   Production (cloud) → IP change karana kotta ekai
 *   .env file use karanawa (currently hardcoded — development only)
 */
