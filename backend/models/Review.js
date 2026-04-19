// =====================================================
// Review.js — Member 6: General Feedback Schema (Blueprint)
// MongoDB eke 'reviews' collection eke document structure define karanawa
//
// Member 6: Food ekak select karanne nathuwa general review ekak danna puluwan widihata
// logic eka update kala. Meka app eke general feedback system eka widihata wada karanawa.
//
// Me model:
//   Customer → general app feedback dagana (rating + comment + optional photo)
//   Manager  → feedback moderate karanawa (delete offensive reviews)
//   ReviewScreen → submit / edit / delete feedback
//
// foodId OPTIONAL — general feedback walata foodId naha; specific food ekakata link karanna puluwan
// =====================================================

// mongoose — Schema + Model + index
const mongoose = require('mongoose');

// =====================================================
// Review Schema — eka review eke fields define
// =====================================================
const reviewSchema = new mongoose.Schema(
    {
        // Member 6 → Member 3 link — mona food item ekakata review da? (optional)
        // naththam general QuickBite app review (no food link)
        foodId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Food',         // Food model ekata link
            required: false,     // Optional — general reviews allow
            default: undefined,  // undefined = field set naha (null != undefined in MongoDB)
        },

        // Member 6 → Member 1 link — kauda review dagana da?
        // JWT eken auto set — authController.js; tamper karanna baha
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'userId eka denna ona!'],
        },

        // Star rating — 1 (bed) to 5 (excellent)
        // Frontend stars UI ekata match wenawa
        rating: {
            type: Number,
            required: [true, 'Rating ekak denna ona!'],
            min: [1, 'Athanin 1 denna ona!'],
            max: [5, 'Bithara 5 thiyanna baha!'],
        },

        // Review text — optional; blank valid
        comment: {
            type: String,
            default: '',
            trim: true, // Auto whitespace trim
        },

        // Review photo — optional Multer upload; uploads/reviews/ path save karanawa
        image: {
            type: String,
            default: '',
        },
    },
    {
        // createdAt + updatedAt auto save wenawa
        timestamps: true,
    }
);

// =====================================================
// Member 6: General reviews keepayak danna puluwan wenna database eke thibba
// unique index eka ain kala. Dan foodId null unath duplicate error enne naha.
//
// Unique index naha — eka user eka kama ekakata hari general review
// keepayak danna puluwan. Mongoose eka auto index hadanne naha.
// =====================================================

// =====================================================
// Model export — 'Review' kiyala MongoDB collection
// reviewController.js + reviewRoutes.js eken import wenawa
// =====================================================
module.exports = mongoose.model('Review', reviewSchema);

/*
 * =====================================================
 * Schema mul sangrahaya — Viva reference
 * =====================================================
 * Member 6 — Review:
 *   foodId    → optional ObjectId ref → Food (Member 3)
 *   userId    → required ObjectId ref → User (Member 1); JWT auto set
 *   rating    → required Number 1-5; min/max validate
 *   comment   → optional; trim
 *   image     → Multer path; optional; uploads/reviews/ folder
 *   timestamps → createdAt, updatedAt
 *
 * Unique index:
 *   REMOVED — general feedback system eke duplicate restrict karanne naha.
 *   Eka user multiple times general feedback danna puluwan.
 *
 * Connected models:
 *   Food.js → foodId ref (Member 3) — optional
 *   User.js → userId ref (Member 1) — required
 *
 * Business rules:
 *   rating min 1, max 5 → DB validate
 *   duplicate restriction naha — general feedback system (multiple reviews OK)
 *   Manager delete → reviewRoutes.js inline handler
 */
