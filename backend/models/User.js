// =====================================================
// User.js — Member 1: User Schema (Blueprint)
// MongoDB eke 'users' collection eke eka document eke structure eka define karanawa
//
// Me model eken save karana users:
//   - Customer  → food order karanawa, reviews liyapu karanawa
//   - Manager   → restaurants + food manage karanawa, orders approve karanawa
//   - Rider     → deliveries accept + complete karanawa
//
// authController.js eken use wenawa — register / login / update / delete
// =====================================================

// mongoose — MongoDB schema + model hadanna library
const mongoose = require('mongoose');

// =====================================================
// User Schema — eka user kenekage fields define
// =====================================================
const userSchema = new mongoose.Schema(
    {
        // User ge nema — required field (blank karanna baha)
        name: {
            type: String,
            required: true
        },

        // Email address — login walata use wenawa; unique = duplicate email block
        // Member 1 authController eke lowercase + trim save karanawa
        email: {
            type: String,
            required: true,
            unique: true // Eka email eken hadanna puluwan eka account ekai
        },

        // Password — authController eke bcrypt hash kara save karanawa
        // Plain text NEVER save — security!
        password: {
            type: String,
            required: true
        },

        // User ge role eka — app eke navigation + permissions determine karanawa
        // 'customer'  → Cart, Orders, Reviews tabs pennawa
        // 'manager'   → Manager Dashboard pennawa
        // 'rider'     → Rider Dashboard pennawa
        role: {
            type: String,
            enum: ['customer', 'manager', 'rider'], // Valid roles witharak 3kai
            default: 'customer' // Nikanma register unoth auto customer wenawa
        },

        // Profile photo file path — Multer uploads/ folder eke save karanawa
        // SERVER_URL + '/' + profilePic → full image URL
        profilePic: {
            type: String,
            default: '' // Photo upload natha naththam blank
        },

        // Sri Lanka mobile number — 07XXXXXXXX wage exactly 10 digits
        // Optional field — blank valid
        phone: {
            type: String,
            default: '',
            validate: {
                validator: function (v) {
                    // Phone eka blank naththam skip — filled naththam 10 digits exact ona
                    if (!v) return true;           // Optional — blank OK
                    return /^\d{10}$/.test(v);     // 10 numeric digits only
                },
                message: 'Phone number eka exactly 10 digits thiyanama ona!'
            }
        }
    },
    {
        // timestamps: true — MongoDB auto createdAt + updatedAt fields add karanawa
        timestamps: true
    }
);

// =====================================================
// Model export — 'User' kiyala MongoDB collection create/access
// authController + protect middleware eken import wenawa
// =====================================================
module.exports = mongoose.model('User', userSchema);

/*
 * =====================================================
 * Schema mul sangrahaya — Viva reference
 * =====================================================
 * Member 1 — User:
 *   name     → required string
 *   email    → unique; lowercase save; login identifier
 *   password → bcrypt hashed; never plain text
 *   role     → 'customer' | 'manager' | 'rider'; enum; default 'customer'
 *   profilePic → Multer path; SERVER_URL + '/' + path = image URL
 *   phone    → optional; Sri Lanka 10 digits; regex validate
 *   timestamps → createdAt, updatedAt auto
 *
 * Connected models:
 *   Order.js  → userId (ref: User)
 *   Review.js → userId (ref: User)
 *   Delivery.js → riderId (ref: User)
 */
