const mongoose = require('mongoose');
const Order = require('../models/Order');
const Delivery = require('../models/Delivery');

// =====================================================
// deliveryController.js — Member 5: Delivery CRUD
// Member 5 ge requirement ekata anuwa Rider ta wenama database collection ekak (Deliveries)
// saha sampurna CRUD (Create, Read, Update, Delete) ekak hadala file upload ekath ekka connect kala.
// =====================================================

// Order + rider/restaurantId populate karanawa
async function populateDelivery(query) {
    return query.populate({
        path: 'orderId',
        populate: [
            { path: 'userId', select: 'name email phone' },
            { path: 'restaurantId', select: 'name address' },
            { path: 'items.foodId', select: 'name price image' },
        ],
    });
}

function riderKey(user) {
    return user.id || user._id;
}

// =====================================================
// CREATE — POST /api/deliveries
// Body: { orderId }   ← JSON string; express.json() middleware parse karanawa
// Database eke 'deliveries' collection eka hadila nathi nisa saha ID eka pass wena widiha
// weradi nisa eka fix kala. Dan button eka weda karanna ona.
// Rider clicks "Accept" → Delivery doc create karanawa + Order update
// =====================================================
exports.createDeliveryTask = async (req, res) => {
    try {
        if (req.user.role !== 'rider') {
            return res.status(403).json({ message: 'Me endpoint eka rider kenek witharak!' });
        }

        // orderId — req.body eken gannawa (frontend JSON.stringify({ orderId }) yawanawa)
        const orderId = req.body.orderId || req.body.id || req.body.order_id;
        console.log('[createDeliveryTask] Received orderId:', orderId, '| riderId:', riderKey(req.user));

        if (!orderId) {
            return res.status(400).json({
                message: "Body eke 'orderId' field eka thiyanama ona! { \"orderId\": \"...\" }",
            });
        }
        if (!mongoose.Types.ObjectId.isValid(String(orderId))) {
            return res.status(400).json({
                message: `orderId eka valid MongoDB ObjectId ekak naha: '${orderId}'`,
            });
        }

        // Already active delivery ekak thiyanawa da check karanawa (duplicate accept block)
        const existing = await Delivery.findOne({
            orderId: String(orderId),
            status: { $ne: 'Delivered' },
        });
        if (existing) {
            return res.status(400).json({
                message: 'Me order eka dan rider kenekta assign wela thiyenawa!',
            });
        }

        // Order atomic update — Ready + unassigned witharak accept karanna puluwan
        const rk = riderKey(req.user);
        const order = await Order.findOneAndUpdate(
            {
                _id: orderId,
                status: 'Ready',
                $or: [{ riderId: null }, { riderId: { $exists: false } }],
            },
            { $set: { riderId: rk, status: 'Picked Up' } },
            { new: true }
        );

        if (!order) {
            console.log('[createDeliveryTask] Order not found or not Ready/unassigned:', orderId);
            return res.status(400).json({
                message: 'Me order eka dan Ready naha hari assign wela — accept karanna baha!',
            });
        }

        // *** Delivery document create karanawa — meken 'deliveries' collection eka hadena ***
        const delivery = await Delivery.create({
            orderId: order._id,
            riderId: rk,
            status: 'Assigned',
            deliveryProof: '',
            deliveredAt: null,
        });

        console.log('[createDeliveryTask] Delivery created:', delivery._id);

        const populated = await populateDelivery(Delivery.findById(delivery._id));

        return res.status(201).json({
            message: 'Delivery task create una — delivery accept una! 🛵',
            delivery: populated,
        });
    } catch (error) {
        console.error('[createDeliveryTask] Error:', error);
        res.status(500).json({ message: 'Delivery create weddi server eke aulk aawa.' });
    }
};

// =====================================================
// READ — GET /api/deliveries
// Rider ge okkoma deliveries (all statuses, newest first)
// =====================================================
exports.getRiderDeliveries = async (req, res) => {
    try {
        if (req.user.role !== 'rider') {
            return res.status(403).json({ message: 'Me endpoint eka rider kenek witharak!' });
        }

        const list = await populateDelivery(
            Delivery.find({ riderId: riderKey(req.user) }).sort({ createdAt: -1 })
        );

        return res.status(200).json(Array.isArray(list) ? list : []);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Deliveries gannata server eke aulk aawa.' });
    }
};

// =====================================================
// UPDATE — PUT /api/deliveries/:id
// Body (JSON/FormData): { status }   + optional deliveryProof file
// Status flow: Assigned → On the Way → Delivered
// 'Delivered' ekata yanna deliveryProof file mandatory
// =====================================================
exports.updateDeliveryStatus = async (req, res) => {
    try {
        if (req.user.role !== 'rider') {
            return res.status(403).json({ message: 'Me route eka rider witharak!' });
        }

        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Valid delivery ID ekak denna!' });
        }

        const delivery = await Delivery.findById(id);
        if (!delivery) {
            return res.status(404).json({ message: 'Me ID eken delivery ekak naha!' });
        }
        if (String(delivery.riderId) !== String(riderKey(req.user))) {
            return res.status(403).json({ message: 'Oya ta me delivery update karanna permission naha!' });
        }
        if (delivery.status === 'Delivered') {
            return res.status(400).json({ message: 'Delivered una deliveries edit karanna baha!' });
        }

        const newStatus = req.body.status;
        const validStatuses = ['Assigned', 'Picked Up', 'On the Way', 'Delivered'];
        if (!newStatus || !validStatuses.includes(newStatus)) {
            return res.status(400).json({
                message: `Status eka Assigned, Picked Up, On the Way, hari Delivered witharak denna ona!`,
            });
        }

        // Delivered status → file ona
        if (newStatus === 'Delivered' && !req.file) {
            return res.status(400).json({
                message: "Delivered karanna kalin delivery proof photo ekak upload karanna ona!",
            });
        }

        // Update delivery doc
        delivery.status = newStatus;

        if (req.file) {
            delivery.deliveryProof = req.file.path;
        }
        if (newStatus === 'Delivered') {
            delivery.deliveredAt = new Date();
        }

        await delivery.save();

        // Order status sync
        const orderStatusMap = {
            'Assigned':   'Picked Up',
            'Picked Up':  'Picked Up',
            'On the Way': 'On the Way',
            'Delivered':  'Delivered',
        };
        const orderStatus = orderStatusMap[newStatus];

        await Order.findByIdAndUpdate(
            delivery.orderId,
            {
                $set: {
                    status: orderStatus,
                    ...(delivery.deliveryProof && { deliveryProof: delivery.deliveryProof }),
                },
            }
        );

        const populated = await populateDelivery(Delivery.findById(delivery._id));
        return res.json({
            message: `Delivery status '${newStatus}' ekata update una! ✅`,
            delivery: populated,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Delivery update weddi server eke aulk aawa.' });
    }
};

// =====================================================
// DELETE — DELETE /api/deliveries/:id
// Rider cancel (Assigned hari Picked Up witharak) → Delivery doc delete, Order reset to Ready
// =====================================================
exports.cancelDeliveryTask = async (req, res) => {
    try {
        if (req.user.role !== 'rider') {
            return res.status(403).json({ message: 'Me route eka rider witharak!' });
        }

        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Valid delivery ID ekak denna!' });
        }

        const delivery = await Delivery.findById(id);
        if (!delivery) {
            return res.status(404).json({ message: 'Me ID eken delivery ekak naha!' });
        }
        if (String(delivery.riderId) !== String(riderKey(req.user))) {
            return res.status(403).json({ message: 'Oya ta me delivery cancel karanna permission naha!' });
        }
        if (['On the Way', 'Delivered'].includes(delivery.status)) {
            return res.status(400).json({
                message: `Delivery eka '${delivery.status}' stage eke thiyenawa — dan cancel karanna baha!`,
            });
        }

        // Order reset → Ready (pool ekata ayin)
        await Order.findByIdAndUpdate(delivery.orderId, {
            $set: { riderId: null, status: 'Ready', deliveryProof: '' },
        });

        await Delivery.findByIdAndDelete(id);

        return res.json({
            message: 'Delivery cancel una — order eka ayin Ready pool ekata awa. 🔄',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Delivery cancel weddi server eke aulk aawa.' });
    }
};

// =====================================================
// HELPER — orderController.js ge assignRider eken call wenawa (backward compat)
// =====================================================
exports.assignOrderToRider = async (orderId, riderObjectId) => {
    const existing = await Delivery.findOne({
        orderId,
        status: { $ne: 'Delivered' },
    });
    if (existing) return null;

    const order = await Order.findOneAndUpdate(
        {
            _id: orderId,
            status: 'Ready',
            $or: [{ riderId: null }, { riderId: { $exists: false } }],
        },
        { $set: { riderId: riderObjectId, status: 'Picked Up' } },
        { new: true }
    );
    if (!order) return null;

    await Delivery.create({ orderId, riderId: riderObjectId, status: 'Assigned' });
    return order;
};

// =====================================================
// HELPER — getActiveDeliveryTask (orders/my-active-task backward compat)
// =====================================================
exports.getActiveDeliveryTask = async (req, res) => {
    try {
        if (req.user.role !== 'rider') {
            return res.status(403).json({ message: 'Me endpoint eka rider kenek witharak!' });
        }

        const rk = riderKey(req.user);
        const deliveries = await populateDelivery(
            Delivery.find({ riderId: rk, status: { $ne: 'Delivered' } }).sort({ createdAt: -1 })
        );

        const list = Array.isArray(deliveries) ? deliveries : [];
        return res.status(200).json(list.length ? [list[0].orderId].filter(Boolean) : []);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Active task gannata server eke aulk aawa.' });
    }
};
