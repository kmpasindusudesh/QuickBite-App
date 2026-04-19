// =====================================================
// Food.js — Member 3: Food Item Schema (Blueprint)
// MongoDB eke 'foods' collection eke document structure define karanawa
//
// Me model:
//   Manager → food items add / update / delete karanawa
//   Home / Restaurant Detail → food list pennawa
//   Customer → food items cart ekata add karanawa
//   Order → items[].foodId eken Food ekata link wenawa (Member 4)
//   Review → foodId eken Food ekata link wenawa (Member 6)
// =====================================================

// mongoose — Schema + Model library
const mongoose = require('mongoose');

// =====================================================
// Food Schema — eka food item eke fields define
// =====================================================
const foodSchema = new mongoose.Schema(
    {
        // Food eke nama — required; blank DB ekata yanna naha
        name: {
            type: String,
            required: [true, 'Food name eka thiyanama ona!'],
            trim: true // Auto whitespace trim
        },

        // Description — optional; blank valid
        description: {
            type: String,
            default: '' // Nadda blank — form eke pennawa naha
        },

        // Price — required; minimum 0.01 (negative + zero price naha)
        // Number type — frontend eken string enna puluwan; mongoose cast karanawa
        price: {
            type: Number,
            required: [true, 'Price eka thiyanama ona!'],
            min: [0.01, 'Price eka zero wage negative karanna baha — valid positive number ekak denna!']
        },

        // Category — required; eg: "Rice", "Burger", "Dessert"
        // Enum validate naha — flexible (manager new categories add karanna puluwan)
        category: {
            type: String,
            required: [true, 'Category eka select karanna ona!']
        },

        // Food photo file path — Multer uploads/ folder eke save karanawa
        // Frontend: SERVER_URL + '/' + image → full image URL
        image: {
            type: String,
            default: '' // Photo naththam blank
        },

        // Member 3 → Member 2 link — restaurant ekakata food item link karanawa
        // required = true — restaurant naththam food ekak add karanna baha!
        restaurantId: {
            type: mongoose.Schema.Types.ObjectId, // MongoDB ObjectId reference
            ref: 'Restaurant',                     // Restaurant model ekata link
            required: [true, 'restaurantId eka thiyanama ona — restaurant ekak select karanna!']
        }
    },
    {
        // createdAt + updatedAt auto save wenawa
        // sort({ createdAt: -1 }) — newest food first
        timestamps: true
    }
);

// =====================================================
// Model export — 'Food' kiyala MongoDB collection access
// foodController.js, orderController.js, reviewController.js eken import wenawa
// =====================================================
module.exports = mongoose.model('Food', foodSchema);

/*
 * =====================================================
 * Schema mul sangrahaya — Viva reference
 * =====================================================
 * Member 3 — Food:
 *   name         → required; trim
 *   description  → optional; blank default
 *   price        → required; min 0.01 (negative prevent)
 *   category     → required; free text (no enum)
 *   image        → Multer path; SERVER_URL + '/' + image = full URL
 *   restaurantId → required ObjectId ref → Restaurant (Member 2)
 *   timestamps   → createdAt, updatedAt auto
 *
 * Connected models:
 *   Restaurant.js → restaurantId ref (Member 2)
 *   Order.js      → items[].foodId ref (Member 4) — order eke food items
 *   Review.js     → foodId ref (Member 6) — food ekakata review
 *
 * Business rules:
 *   - price min 0.01 → DB level validate (negative prevent)
 *   - restaurantId required → orphan food items naha
 *   - foodController.resolveRestaurantId() → restaurant exists check
 */
