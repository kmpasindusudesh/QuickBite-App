const express = require('express');

// protect middleware — JWT check karanawa
const protect = require('../middleware/authMiddleware');

// Cloudinary Multer — payment slip + delivery proof
const { cloudinaryUpload } = require('../config/cloudinaryConfig');

// Order controller — actual logic methata
const orderController = require('../controllers/orderController');

const router = express.Router();

// =====================================================
// orderRoutes.js — Member 4: Order & Payment Routes
// All routes walata protect (login ona)
// POST route eke upload.single('paymentSlip') — slip optional
// =====================================================

// POST /api/orders — Aluth order ekak add karanawa
// FormData eken items JSON + slip image enawa
// paymentSlip = multer eke field name eka
router.post(
    '/',
    protect,
    cloudinaryUpload.single('paymentSlip'),
    orderController.createOrder
);

// Route ordering prashne fix kala. /available route eka /:id ekata udin damma error eka ain karanna.
// Rider list routes — GET /:id kalin PERA (naththam "available" kiyana eka order ID widihata match wenawa).
router.get('/available', protect, orderController.getAvailableOrders);
router.get('/my-active-task', protect, orderController.getRiderActiveTask);

// GET /api/orders — Manager ta okkoma / customer ta own orders
// ?restaurantId=xxx query param danna puluwan — manager filter karanawa
router.get('/', protect, orderController.getOrders);

// GET /api/orders/:id — Eka order (me GET eka hama widiyama path eke bottom — /:id catch-all)
router.get('/:id', protect, orderController.getOrderById);

// PUT /api/orders/:id/status — Manager ta status wenas karanawa
// Body: { status: "Preparing" }
router.put('/:id/status', protect, orderController.updateOrderStatus);

// PUT /api/orders/:id/assign — Rider assign (Ready → Picked Up, riderId set)
router.put('/:id/assign', protect, orderController.assignRider);

// PUT /api/orders/:id/delivery-status — Rider: On the Way / Delivered
router.put('/:id/delivery-status', protect, orderController.updateDeliveryStatus);

// PUT /api/orders/:id/delivery-proof — Rider: proof image + status Delivered
router.put(
    '/:id/delivery-proof',
    protect,
    cloudinaryUpload.single('deliveryProof'),
    orderController.uploadProof
);

// PUT /api/orders/:id/cancel-delivery — Rider: release order (Ready pool)
router.put('/:id/cancel-delivery', protect, orderController.cancelDelivery);

// PUT /api/orders/:id — Customer ta Pending order edit (items / total / slip) — /:id/status passe register karanawa
router.put(
    '/:id',
    protect,
    cloudinaryUpload.single('paymentSlip'),
    orderController.updateOrder
);

// DELETE /api/orders/:id — Cancel order
// Customer: Pending orders witharak; Manager: any status
router.delete('/:id', protect, orderController.deleteOrder);

module.exports = router;

/*
 * Mul sangrahaya (Sinhala):
 * POST /api/orders — bank slip + order data save karanawa (FormData).
 * GET /api/orders — manager ta okkoma, customer ta own.
 * GET /api/orders/available — rider ta Ready pool.
 * GET /api/orders/my-active-task — rider ge active task (findOne).
 * GET /api/orders/:id — eka order.
 * PUT /api/orders/:id/status — manager status update.
 * PUT /api/orders/:id/assign — rider accept.
 * PUT /api/orders/:id/delivery-status — rider status.
 * PUT /api/orders/:id/delivery-proof — rider proof upload.
 * PUT /api/orders/:id/cancel-delivery — rider release.
 * PUT    /api/orders/:id — customer Pending order edit (multipart).
 * DELETE /api/orders/:id — customer Pending cancel; manager okke.
 * Okkoma routes walata JWT protect middleware thiyenawa.
 */
