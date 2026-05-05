// mongoose — Schema + Model + indexes
const mongoose = require('mongoose');

// =====================================================
// Delivery Schma — eka delivery task eke fields define
// =====================================================
const deliverySchema = new mongoose.Schema(
    {
        // Member 5 → Member 4 link — mona order eka deliver karanawada?
        // Order model eke _id ekata reference
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',          // Order collection ekata link
            required: [true, 'orderId eka thiyanama ona!'],
        },

        // Member 5 → Member 1 link — kauda rider delivery gaththa da?
        // JWT eken auto set — tamper karanna baha
        riderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',           // User collection ekata link (role: 'rider')
            required: [true, 'riderId eka thiyanama ona!'],
        },

        // Delivery eke giya paar — rider workflow:
        // 'Assigned'   → Rider accept kala (Delivery create wuna)
        // 'Picked Up'  → Rider restaurant eken food gaththa
        // 'On the Way' → Rider customer ekata yawanawa (delivery started)
        // 'Delivered'  → Rider proof photo upload kala — complete!
        status: {
            type: String,
            enum: {
                values: ['Assigned', 'Picked Up', 'On the Way', 'Delivered'],
                message:
                    "Status eka 'Assigned', 'Picked Up', 'On the Way', hari 'Delivered' witharak thiyana puluwan!",
            },
            default: 'Assigned', // Create wenakotat Assigned (just accepted)
        },

        // Delivery proof photo — Multer uploads/delivery/ folder eke save karanawa
        // Rider 'Complete Delivery' button press kala camera eken photo gannawa
        // deliveryController.js eke addDeliveryProof() function eken set wenawa
        deliveryProof: {
            type: String,
            default: '', // Proof upload naththam blank
        },

        // Deliver wuna exact time — status 'Delivered' karakotat set wenawa
        // History screen eke pennawa puluwan — tracking walata useful
        deliveredAt: {
            type: Date,
            default: null, // Delivered naththam null
        },
    },
    {
        // createdAt = delivery accept karapu time
        // updatedAt = last status change time
        timestamps: true,
    }
);

// =====================================================
// INDEXES — Query performance walata
// =====================================================
// riderId + status → Rider ge active tasks fast gannawa
deliverySchema.index({ riderId: 1, status: 1 });

// orderId → eka order ekata linked delivery fast find karanawa
deliverySchema.index({ orderId: 1 });

// =====================================================
// Model export — 'Delivery' kiyala MongoDB collection
// deliveryController.js + orderController.js eken import wenawa
// =====================================================
module.exports = mongoose.model('Delivery', deliverySchema);

/*
 * =====================================================
 * Schema mul sangrahaya — Viva reference
 * =====================================================
 * Member 5 — Delivery:
 *   orderId       → required ObjectId ref → Order (Member 4)
 *   riderId       → required ObjectId ref → User (Member 1; role: 'rider')
 *   status        → enum ['Assigned','Picked Up','On the Way','Delivered']
 *                   default 'Assigned'
 *   deliveryProof → Multer path; uploads/delivery/ folder
 *   deliveredAt   → Date; null until Delivered
 *   timestamps    → createdAt (accept time), updatedAt (last update)
 *
 * Indexes:
 *   { riderId, status } → active task queries fast
 *   { orderId }         → order → delivery lookup fast
 *
 * Connected models:
 *   Order.js → orderId ref (Member 4) — delivery eke order details
 *   User.js  → riderId ref (Member 1) — delivery eke rider
 *
 * CRUD:
 *   CREATE → createDeliveryTask()   POST /api/deliveries
 *   READ   → getRiderDeliveries()   GET  /api/deliveries
 *   UPDATE → updateDeliveryStatus() PUT  /api/deliveries/:id
 *   DELETE → cancelDeliveryTask()   DELETE /api/deliveries/:id
 */
