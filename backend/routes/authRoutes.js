// =====================================================
// authRoutes.js — Member 1: Authentication & User Routes
// Express Router — URL path eka controller function ekata connect karanawa
//
// MVC pattern: Route eka request receive kara → Controller ekata yawanawa
// server.js eke: app.use('/api/auth', authRoutes) → me file register wenawa
//
// Routes map:
//   POST   /api/auth/register    → register()         (no auth)
//   POST   /api/auth/login       → login()            (no auth; JWT return)
//   GET    /api/auth/profile     → getProfile()       (JWT required)
//   PUT    /api/auth/update      → updateUser()       (JWT required)
//   DELETE /api/auth/delete      → deleteUser()       (JWT required)
//   PUT    /api/auth/profile-pic → uploadProfilePic() (JWT + Multer)
// =====================================================

// express — Web framework; Router eka route management walata
const express = require('express');

// authController — Member 1 logic okkoma methata
const authController = require('../controllers/authController');

// Cloudinary Multer — profile photo
const { cloudinaryUpload } = require('../config/cloudinaryConfig');

// protect — JWT verify middleware; valid token naththam 401 return
// req.user = { id, role } decode kara set wenawa (authController walata available)
const protect = require('../middleware/authMiddleware');

// Router instance — app.use() eke register karanawa
const router = express.Router();

// =====================================================
// Routes define karanawa
// =====================================================

// CREATE — POST /api/auth/register
// Aluth user kenekuta account hadanawa
// JWT naththam OK — public registration
router.post('/register', authController.register);

// READ (special) — POST /api/auth/login
// Email + password check kara JWT token return karanawa
// POST use karanawa — credentials body eke yawanawa (URL eke naha — security)
router.post('/login', authController.login);

// READ — GET /api/auth/profile
// protect middleware — JWT valid da check karanawa
// Valid naththam → getProfile() call → DB eken user data return
router.get('/profile', protect, authController.getProfile);

// UPDATE — PUT /api/auth/update
// protect → own profile witharak update (JWT eke user id use)
router.put('/update', protect, authController.updateUser);

// DELETE — DELETE /api/auth/delete
// protect → own account witharak delete (JWT eke user id use)
router.delete('/delete', protect, authController.deleteUser);

// UPDATE (file upload) — PUT /api/auth/profile-pic
// protect → JWT check
// upload.single('image') → Multer; 'image' = form field name (frontend match wenawa)
// uploadProfilePic → path DB ekata save
router.put('/profile-pic', protect, cloudinaryUpload.single('image'), authController.uploadProfilePic);

// Router export — server.js eke app.use('/api/auth', authRoutes) ekata
module.exports = router;

/*
 * =====================================================
 * File mul sangrahaya — Viva reference
 * =====================================================
 * Member 1 — Auth Routes:
 *   POST   /register    → Public; no middleware
 *   POST   /login       → Public; returns JWT + user
 *   GET    /profile     → protect (JWT)
 *   PUT    /update      → protect (JWT)
 *   DELETE /delete      → protect (JWT)
 *   PUT    /profile-pic → protect + Multer upload
 *
 * Middleware chain (order matters!):
 *   protect → upload.single() → controller
 *   protect runs first → unauthorized naththam Multer run naha
 *
 * Frontend usage:
 *   RegisterScreen   → POST /register
 *   LoginScreen      → POST /login → token + user save (storage.js)
 *   ProfileScreen    → GET /profile, PUT /update, PUT /profile-pic, DELETE /delete
 */
