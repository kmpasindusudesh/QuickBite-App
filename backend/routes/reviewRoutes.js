// =====================================================
// reviewRoutes.js — Member 6: Review & Rating Routes
// Express Router — Review API URL paths define karanawa
//
// server.js eke: app.use('/api/reviews', reviewRoutes)
//
// Routes map:
//   POST   /api/reviews           → createReview()  (JWT + Multer 'reviewImage')
//   GET    /api/reviews           → getReviews()    (Public; ?foodId= optional)
//   GET    /api/reviews/food/:foodId → food reviews + average (Public)
//   PUT    /api/reviews/:id       → updateReview()  (JWT; owner only)
//   DELETE /api/reviews/:id       → inline handler  (JWT; owner or manager)
// =====================================================

// express — Router hadanna
const express = require('express');

// mongoose — ObjectId validate karanawa (review / food ID validation)
const mongoose = require('mongoose');

// Review model — GET /food/:foodId eke DB query walata
const Review = require('../models/Review');

// protect — JWT verify middleware
const protect = require('../middleware/authMiddleware');

// reviewUpload — Review image Multer middleware (uploads/reviews/ folder)
// Field name: 'reviewImage' — frontend FormData ekata exact match wenawa
const { cloudinaryUpload } = require('../config/cloudinaryConfig');

// Controller functions import
const { getReviews, createReview, updateReview } = require('../controllers/reviewController');

// Router instance
const router = express.Router();

// =====================================================
// CREATE — POST /api/reviews
// Member 6: Aluth review ekak submit karanawa
// protect — JWT required (userId JWT eken auto gannawa)
// upload.single('reviewImage') — 'reviewImage' field name backend + frontend match
// IMPORTANT: Multer 'Unexpected field' error naththam field names match karanawa
// =====================================================
router.post('/', protect, cloudinaryUpload.single('reviewImage'), createReview);

// =====================================================
// READ ALL — GET /api/reviews
// Member 6: Reviews list gannawa (public)
// ?foodId= query param optional — specific food reviews filter
// Manager Dashboard → okkoma reviews see karanawa (moderation)
// =====================================================
router.get('/', getReviews);

// =====================================================
// READ BY FOOD — GET /api/reviews/food/:foodId
// Member 6: Eka food item ekakata thiyana reviews + average rating
// Public — login naththam balanna puluwan
// FoodDetailScreen eke star rating + review list walata use wenawa
// =====================================================
router.get('/food/:foodId', async (req, res) => {
    try {
        // 1. URL eken foodId gannawa
        const { foodId } = req.params;

        // 2. Valid MongoDB ObjectId da check
        if (!mongoose.Types.ObjectId.isValid(foodId)) {
            return res.status(400).json({ message: 'Valid foodId ekak denna!' });
        }

        // 3. Me food ekakata thiyana okkoma reviews gannawa
        // .populate('userId', 'name') — reviewer name pennawa
        // .sort({ createdAt: -1 }) — newest first
        const reviews = await Review.find({ foodId })
            .populate('userId', 'name')
            .populate('foodId', 'name')
            .sort({ createdAt: -1 });

        // 4. Average rating calculate karanawa
        // reduce() → okkoma ratings sum; / length → average
        // reviews.length === 0 nam null return (no rating yet)
        const avgRating = reviews.length > 0
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : null;

        // 5. Response: count + average + full list
        res.json({
            count:         reviews.length, // Total review count
            averageRating: avgRating,       // "4.3" wage — FoodDetail star UI walata
            reviews                         // Full array
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Reviews gannata server eke aulk aawa.' });
    }
});

// =====================================================
// UPDATE — PUT /api/reviews/:id
// Member 6: Own review eka wenas karanawa (rating, comment, image)
// protect — JWT + owner check (reviewController.updateReview eke)
// upload.single('reviewImage') — optional new image upload
// =====================================================
router.put('/:id', protect, cloudinaryUpload.single('reviewImage'), updateReview);

// =====================================================
// DELETE — DELETE /api/reviews/:id
// Member 6: Review eka database eken ain karanawa
// Own review hari Manager role → delete allowed
// Wenath kenekage review → 403 Forbidden
// =====================================================
router.delete('/:id', protect, async (req, res) => {
    try {
        // 1. URL eken review id gannawa
        const { id } = req.params;

        // 2. Valid ObjectId check
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Valid review ID ekak denna!' });
        }

        // 3. Review DB eke thiyenawada
        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ message: 'Me review eka naha!' });
        }

        // 4. Permission check
        // Owner: review.userId == req.user.id → own review
        // Manager: req.user.role === 'manager' → moderation
        const isOwner   = String(review.userId) === String(req.user.id);
        const isManager = req.user.role === 'manager';

        // 5. Owner naththam + Manager naththam → 403
        if (!isOwner && !isManager) {
            return res.status(403).json({ message: 'Oyage review eka witharak delete karanna puluwan!' });
        }

        // 6. Delete
        await Review.findByIdAndDelete(id);

        // 7. Success
        res.json({ message: 'Review eka delete una! 🗑️' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Review delete weddi server eke aulk aawa.' });
    }
});

// Export
module.exports = router;

/*
 * =====================================================
 * File mul sangrahaya — Viva reference
 * =====================================================
 * Member 6 — Review Routes:
 *   POST   /           → protect + Multer 'reviewImage' → createReview()
 *   GET    /           → Public → getReviews() (?foodId= filter)
 *   GET    /food/:foodId → Public → reviews + averageRating
 *   PUT    /:id        → protect + Multer → updateReview() (owner only)
 *   DELETE /:id        → protect + inline → owner or manager
 *
 * Key patterns:
 *   1. Multer field name 'reviewImage' — frontend FormData field match karanawa
 *   2. Average rating = sum / count (reviewSchema walata naha — runtime calculate)
 *   3. Delete: owner hari manager → flexible moderation
 *
 * Frontend usage:
 *   ReviewScreen       → POST / (create), PUT /:id (update)
 *   FoodDetailScreen   → GET /food/:foodId (star rating + list)
 *   ManagerDashboard   → GET / (all reviews), DELETE /:id (moderation)
 */
