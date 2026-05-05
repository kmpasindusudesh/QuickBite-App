// =====================================================
// deliveryRoutes.js — Member 5: Delivery CRUD Routes
// Express Router — Delivery API URL paths define karanawa
//
// server.js eke: app.use('/api/deliveries', deliveryRoutes)
//
// Routes map:
//   POST   /api/deliveries      → createDeliveryTask()   (Rider; body: { orderId })
//   GET    /api/deliveries      → getRiderDeliveries()   (Rider; own deliveries)
//   PUT    /api/deliveries/:id  → updateDeliveryStatus() (Rider + optional Multer)
//   DELETE /api/deliveries/:id  → cancelDeliveryTask()   (Rider; Assigned/Picked Up only)
//
// IMPORTANT: Me okkoma routes Rider role WITHARAK access karanna puluwan
// Controller eke check wenawa — protect JWT ekai + role check ekai
// =====================================================

// express — Router hadanna
const express = require('express');

// protect — JWT verify middleware; unauthorized reject
const protect = require('../middleware/authMiddleware');

// Cloudinary Multer — delivery proof (field: 'deliveryProof')
const { cloudinaryUpload } = require('../config/cloudinaryConfig');

// deliveryController — Member 5 CRUD logic okkoma methata
const dc = require('../controllers/deliveryController');

// Router instance
const router = express.Router();

// =====================================================
// CREATE — POST /api/deliveries
// Member 5: Rider kenekage "Accept Delivery" button press karakotat call wenawa
// Body: { orderId } — mona order eka accept karanawada kiyala
// 1. Order validate + atomic claim (Ready + unassigned)
// 2. Delivery document create (status: 'Assigned')
// 3. Order eke riderId + status update (Picked Up)
// =====================================================
router.post('/', protect, dc.createDeliveryTask);

// =====================================================
// READ — GET /api/deliveries
// Member 5: Rider ge okkoma delivery tasks gannawa (all statuses)
// Frontend: active tasks filter karanawa (status !== 'Delivered')
// "My Active Task" tab eke pennawa
// =====================================================
router.get('/', protect, dc.getRiderDeliveries);

// =====================================================
// UPDATE — PUT /api/deliveries/:id
// Member 5: Delivery status wenas karanawa + optional proof photo
// Body: { status: 'Picked Up' | 'On the Way' | 'Delivered' }
// File: deliveryProof (status === 'Delivered' naththam required)
// deliveryUpload.single('deliveryProof') — Multer field name
// =====================================================
router.put(
    '/:id',
    protect,
    cloudinaryUpload.single('deliveryProof'), // Multer: photo upload optional
    dc.updateDeliveryStatus
);

// =====================================================
// DELETE — DELETE /api/deliveries/:id
// Member 5: Delivery cancel karanawa (rider change of mind)
// Allowed: 'Assigned' hari 'Picked Up' status witharak
// 'On the Way' hari 'Delivered' naththam — cancel baha (too late)
// Order eka ayin pool ekata yawanawa (riderId null, status Ready)
// =====================================================
router.delete('/:id', protect, dc.cancelDeliveryTask);

// Export — server.js eke register karanawa
module.exports = router;

/*
 * =====================================================
 * File mul sangrahaya — Viva reference
 * =====================================================
 * Member 5 — Delivery Routes:
 *   POST   /     → protect → createDeliveryTask()   (Rider; { orderId })
 *   GET    /     → protect → getRiderDeliveries()   (Rider; own list)
 *   PUT    /:id  → protect + Multer → updateDeliveryStatus() (Rider; status + photo)
 *   DELETE /:id  → protect → cancelDeliveryTask()   (Rider; early cancel only)
 *
 * Status workflow:
 *   Accept → 'Assigned' → 'Picked Up' → 'On the Way' → 'Delivered'
 *   Cancel → DELETE (Assigned/Picked Up only; On the Way baha)
 *
 * Multer:
 *   deliveryUpload.single('deliveryProof')
 *   Field name 'deliveryProof' — frontend FormData match karanawa
 *   Delivered status walata proof required — controller validate
 *
 * Frontend usage:
 *   RiderDashboardScreen:
 *     Tab 1 (Available) → GET /api/orders/available (Order collection)
 *     Tab 2 (Active)    → GET /api/deliveries (Delivery collection)
 *     Accept button     → POST /api/deliveries
 *     Status buttons    → PUT /api/deliveries/:id
 *     Complete + photo  → PUT /api/deliveries/:id (FormData)
 *     Cancel button     → DELETE /api/deliveries/:id
 */


