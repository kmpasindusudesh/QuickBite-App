// =====================================================
// restaurantRoutes.js — Member 2: Restaurant Routes
// Express Router — Restaurant API URL paths define karanawa
//
// server.js eke: app.use('/api/restaurants', restaurantRoutes)
//
// Routes map:
//   POST   /api/restaurants      → createRestaurant()   (Manager + Multer)
//   GET    /api/restaurants      → getAllRestaurants()   (Public)
//   GET    /api/restaurants/:id  → getRestaurantById()  (Public)
//   PUT    /api/restaurants/:id  → updateRestaurant()   (Manager + Multer)
//   DELETE /api/restaurants/:id  → deleteRestaurant()   (Manager)
// =====================================================

// express — Router instance hadanna
const express = require('express');

// restaurantController — Member 2 CRUD logic methata
const restaurantController = require('../controllers/restaurantController');

// Cloudinary Multer — restaurant logo (field: 'logo')
const { cloudinaryUpload } = require('../config/cloudinaryConfig');

// protect — JWT verify; unauthorized reject
const protect = require('../middleware/authMiddleware');

// Router instance
const router = express.Router();

// =====================================================
// onlyManager — Role-based access control (RBAC)
// protect middleware eken req.user set wela thiyenawa
// role 'manager' naththam 403 Forbidden return
// Food routes eke meka wage eka use wenawa (DRY principle)
// =====================================================
const onlyManager = (req, res, next) => {
    if (req.user && req.user.role === 'manager') {
        return next(); // Manager — continue to controller
    }
    // Customer / Rider / unknown role — block
    return res.status(403).json({ message: 'Me feature eka Manager witharak!' });
};

// =====================================================
// Routes
// =====================================================

// CREATE — POST /api/restaurants
// Manager witharak add karanna puluwan
// upload.single('logo') — 'logo' = Multer field name (frontend match karanawa)
router.post('/', protect, onlyManager, cloudinaryUpload.single('logo'), restaurantController.createRestaurant);

// READ ALL — GET /api/restaurants
// Public — login naththam balanna puluwan
// Home screen restaurant list walata use wenawa
router.get('/', restaurantController.getAllRestaurants);

// READ ONE — GET /api/restaurants/:id
// Public — restaurant detail screen walata use wenawa
// :id = MongoDB ObjectId (URL parameter)
router.get('/:id', restaurantController.getRestaurantById);

// UPDATE — PUT /api/restaurants/:id
// Manager only; optional logo file upload
router.put('/:id', protect, onlyManager, cloudinaryUpload.single('logo'), restaurantController.updateRestaurant);

// DELETE — DELETE /api/restaurants/:id
// Manager only; linked food check karanawa (restaurantController.deleteRestaurant)
router.delete('/:id', protect, onlyManager, restaurantController.deleteRestaurant);

// Export — server.js eke register karanawa
module.exports = router;

/*
 * =====================================================
 * File mul sangrahaya — Viva reference
 * =====================================================
 * Member 2 — Restaurant Routes:
 *   POST   /          → protect + onlyManager + Multer logo
 *   GET    /          → Public (no middleware)
 *   GET    /:id       → Public (no middleware)
 *   PUT    /:id       → protect + onlyManager + Multer logo
 *   DELETE /:id       → protect + onlyManager
 *
 * Middleware chain:
 *   protect → onlyManager → upload.single('logo') → controller
 *
 * Frontend usage:
 *   HomeScreen            → GET /api/restaurants (restaurant list)
 *   RestaurantDetailScreen → GET /api/restaurants/:id
 *   AddRestaurantScreen    → POST /api/restaurants (Manager)
 *   EditRestaurantScreen   → PUT /api/restaurants/:id (Manager)
 *   ManageRestaurantsScreen → GET + DELETE (Manager)
 */
