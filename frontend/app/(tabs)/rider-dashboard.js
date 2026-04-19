// =====================================================
// rider-dashboard.js — Rider Dashboard Tab (Expo Router wrapper)
// Member 5: Delivery & Dispatch Management
//
// Actual logic: src/components/js/RiderDashboardScreen.js
//
// This screen is the Rider's delivery management center with 2 inner tabs:
//   Tab 1 — Available Orders
//             GET /api/orders/available (Ready + unassigned)
//             "Accept Delivery" → POST /api/deliveries { orderId }
//   Tab 2 — My Active Task
//             GET /api/deliveries (rider's non-Delivered tasks)
//             Status buttons:
//               "Picked Up"       → PUT /api/deliveries/:id { status: 'Picked Up' }
//               "Start Delivery"  → PUT /api/deliveries/:id { status: 'On the Way' }
//               "Complete Delivery" → PUT /api/deliveries/:id (FormData: status + photo)
//               "Cancel"          → DELETE /api/deliveries/:id
//
// Tab visibility: Rider witharak (isRider = true → href: '/rider-dashboard')
// =====================================================
import RiderDashboardScreen from '../../src/components/js/RiderDashboardScreen';
export default RiderDashboardScreen;
