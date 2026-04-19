// =====================================================
// Restaurant.js — Member 2: Restaurant Schema (Blueprint)
// MongoDB eke 'restaurants' collection eke document structure define karanawa
//
// Me model:
//   Manager → restaurants create / update / delete karanawa
//   Home Screen → restaurant list pennawa (getAllRestaurants)
//   Food items → restaurantId eken me model ekata link wenawa (Member 3)
//   Orders → restaurantId eken me model ekata link wenawa (Member 4)
// =====================================================

// mongoose — Schema + Model hadanna
const mongoose = require('mongoose');

// =====================================================
// Restaurant Schema — eka restaurant eke fields define
// =====================================================
const restaurantSchema = new mongoose.Schema(
    {
        // Restaurant eke nama — required; minimum 2 characters
        // blank restaurant add karanna naha (minlength validate)
        name: {
            type: String,
            required: [true, 'Restaurant name eka thiyanama ona!'],
            trim: true,        // Auto whitespace trim
            minlength: [2, 'Restaurant name eka athanin 2 characters thiyanama ona!']
        },

        // Location address — required; minimum 5 characters
        // "LK" wage too short addresses block karanawa
        address: {
            type: String,
            required: [true, 'Address eka thiyanama ona!'],
            trim: true,
            minlength: [5, 'Address eka athanin 5 characters thiyanama ona!']
        },

        // Wada karana wela — example: "Mon-Sun 9AM - 10PM"
        // Optional — blank valid
        workingHours: {
            type: String,
            default: ''
        },

        // Logo image eke file path — Multer uploads/ folder eke save karanawa
        // restaurantUploadMiddleware.js eke define; path.posix.join use
        // Frontend: SERVER_URL + '/' + logo → full image URL
        logo: {
            type: String,
            default: '' // Logo upload natha naththam blank
        }
    },
    {
        // createdAt + updatedAt auto save wenawa
        timestamps: true
    }
);

// =====================================================
// Model export — 'Restaurant' kiyala MongoDB collection create/access
// restaurantController.js + foodController.js eken import wenawa
// =====================================================
module.exports = mongoose.model('Restaurant', restaurantSchema);

/*
 * =====================================================
 * Schema mul sangrahaya — Viva reference
 * =====================================================
 * Member 2 — Restaurant:
 *   name         → required; trim; min 2 chars
 *   address      → required; trim; min 5 chars
 *   workingHours → optional string; display only
 *   logo         → Multer path; SERVER_URL + '/' + logo = full URL
 *   timestamps   → createdAt, updatedAt auto
 *
 * Connected models:
 *   Food.js  → restaurantId (ref: 'Restaurant') — Member 3
 *   Order.js → restaurantId (ref: 'Restaurant') — Member 4
 *
 * Business rule:
 *   Restaurant delete karanna kalin linked food items naha da check karanawa
 *   (restaurantController.js → deleteRestaurant())
 *   Food linked naththam delete block — data integrity
 */
