const mongoose = require('mongoose');

// =====================================================
// Order.js — Member 4: Order & Payment Management
// Eka order eke structure (blueprint) eka define karanawa
// userId, restaurantId, items (food + quantity), totalAmount,
// status, paymentSlip (bank slip image path)
// =====================================================

// =====================================================
// Eka order item eke sub-schema — foodId + quantity
// Eg: { foodId: ObjectId, quantity: 2 }
// =====================================================
const orderItemSchema = new mongoose.Schema(
    {
        // Mona food item ekakda — Food model ekata ObjectId eken link (Member 3)
        foodId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Food',
            required: [true, 'foodId eka denna ona!']
        },
        // Ganna quantity eka — aduth 1 thiyanama ona
        quantity: {
            type: Number,
            required: [true, 'Quantity eka denna ona!'],
            min: [1, 'Quantity eka aduth 1 thiyanama ona!']
        }
    },
    { _id: false } // Sub-document walata wena _id naha — clean
);

// =====================================================
// Order main schema eka
// =====================================================
const orderSchema = new mongoose.Schema(
    {
        // Kauda order karuwa da — User model ekata link (Member 1)
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'userId eka thiyanama ona!']
        },

        // Koheda order karuwa da — Restaurant model ekata link (Member 2)
        restaurantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: [true, 'restaurantId eka thiyanama ona!']
        },

        // Food items array — godak items thiyana puluwan
        items: {
            type: [orderItemSchema],
            validate: {
                validator: (arr) => Array.isArray(arr) && arr.length > 0,
                message: 'Order eke aduth food item ekak thiyanama ona!'
            }
        },

        // Mulu bill eka (LKR)
        totalAmount: {
            type: Number,
            required: [true, 'totalAmount eka denna ona!'],
            min: [0, 'totalAmount eka 0 witharak thiyana baha!']
        },

        // Order eke giya paar — kitchen → Ready → rider (Picked Up / On the Way) → Delivered
        status: {
            type: String,
            enum: {
                values: ['Pending', 'Preparing', 'Ready', 'Picked Up', 'On the Way', 'Delivered'],
                message:
                    'Status eka Pending, Preparing, Ready, Picked Up, On the Way, hari Delivered witharak thiyana puluwan!'
            },
            default: 'Pending'
        },

        // Rider kenek order eka gaththa — Member 5 delivery flow
        riderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },

        // Delivery confirm image URL / path
        deliveryProof: {
            type: String,
            default: ''
        },

        // Bank slip eke image path (Multer save karapu eka)
        // Eg: 'uploads/slips/slip-1712345678901.jpg'
        paymentSlip: {
            type: String,
            default: '' // Slip nadda blank string — required naha
        }
    },
    {
        timestamps: true // createdAt + updatedAt auto save wenawa
    }
);

module.exports = mongoose.model('Order', orderSchema);

/*
 * Mul sangrahaya (Sinhala):
 * Me schema eken order ekak save karanna structure eka define karanawa.
 * userId → Member 1 User, restaurantId → Member 2 Restaurant,
 * items[] → Member 3 Food (foodId + quantity).
 * status + riderId + deliveryProof — Member 5 rider flow ekata.
 * paymentSlip eka bank slip image eke path eka (Multer eken save karanawa).
 */
