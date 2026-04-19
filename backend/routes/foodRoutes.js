// =====================================================
// foodRoutes.js — Member 3: Food Item Routes
// Express Router — Food API URL paths define karanawa
//
// server.js eke: app.use('/api/food', foodRoutes)
//
// Routes map:
//   POST   /api/food/add   → addFood()       (Manager + Multer)
//   POST   /api/food/      → addFood()       (backward compat alias)
//   GET    /api/food/      → getAllFoods()   (Public)
//   PUT    /api/food/:id   → updateFood()    (Manager + Multer)
//   DELETE /api/food/:id   → deleteFood()    (Manager)
// =====================================================

// express — Router hadanna
const express = require('express');

// foodController — Member 3 CRUD logic methata
const foodController = require('../controllers/foodController');

// Cloudinary Multer — food image (field: 'image')
const { cloudinaryUpload } = require('../config/cloudinaryConfig');

// protect — JWT verify middleware
const protect = require('../middleware/authMiddleware');

// Router instance
const router = express.Router();

// =====================================================
// onlyManager — Manager role check middleware
// protect eka run kala passe req.user available
// role 'manager' naththam 403 return
// =====================================================
const onlyManager = (req, res, next) => {
    if (req.user && req.user.role === 'manager') {
        return next(); // Manager — continue
    }
    // Customer / Rider block
    return res.status(403).json({ message: 'Me feature eka Manager witharak!' });
};

// =====================================================
// Routes
// =====================================================

// CREATE — POST /api/food/add
// Manager witharak food add karanna puluwan
// upload.single('image') — 'image' field Multer process karanawa
router.post('/add', protect, onlyManager, cloudinaryUpload.single('image'), foodController.addFood);

// CREATE (alias) — POST /api/food/
// Kalin thibba API eka backward compatibility walata
// Same controller function — rende path deka okkoma addFood() call karanawa
router.post('/', protect, onlyManager, cloudinaryUpload.single('image'), foodController.addFood);

// READ ALL — GET /api/food/
// Public — login naththam food list balanna puluwan
// Home screen + RestaurantDetailScreen walata use wenawa
router.get('/', foodController.getAllFoods);

// UPDATE — PUT /api/food/:id
// Manager only; optional image upload
// :id = MongoDB ObjectId — food item identify karanawa
router.put('/:id', protect, onlyManager, cloudinaryUpload.single('image'), foodController.updateFood);

// DELETE — DELETE /api/food/:id
// Manager only; simple delete
router.delete('/:id', protect, onlyManager, foodController.deleteFood);

// Export
module.exports = router;

/*
 * =====================================================
 * File mul sangrahaya — Viva reference
 * =====================================================
 * Member 3 — Food Routes:
 *   POST   /add     → protect + onlyManager + Multer image
 *   POST   /        → Same (backward compat)
 *   GET    /        → Public (no middleware)
 *   PUT    /:id     → protect + onlyManager + Multer image
 *   DELETE /:id     → protect + onlyManager
 *
 * Middleware chain:
 *   protect → onlyManager → upload.single('image') → controller
 *
 * Frontend usage:
 *   HomeScreen             → GET /api/food (all foods)
 *   RestaurantDetailScreen → GET /api/food (filter by restaurantId)
 *   AddFoodScreen          → POST /api/food/add (Manager)
 *   EditFoodScreen         → PUT /api/food/:id (Manager)
 *   ManagerDashboard       → DELETE /api/food/:id (Manager)
 *
 * Security fix:
 *   PUT + DELETE walata protect + onlyManager damma
 *   Login naththam / manager naththam kenekta modify karanna baha
 */
