const mongoose = require('mongoose');
const Order = require('../models/Order');
// Member 5 — Delivery collection (deliveryController.js) — rider accept / progress / proof
const deliveryController = require('./deliveryController');

// =====================================================
// orderController.js — Member 4: Order & Payment Management
// Routes file eka thin — actual logic methata thiyenawa
// =====================================================

// =====================================================
// CREATE ORDER — POST /api/orders
// Bank slip eka upload karala order eka save karana thana.
// protect middleware eken userId JWT eken auto gannawa
// Multer eken req.file (paymentSlip) available wenawa
// =====================================================
exports.createOrder = async (req, res) => {
    try {
        const { restaurantId, items, totalAmount } = req.body;

        // restaurantId valid ObjectId da check karanawa
        if (!restaurantId || !mongoose.Types.ObjectId.isValid(restaurantId)) {
            return res.status(400).json({ message: 'Valid restaurantId ekak denna ona!' });
        }

        // items JSON string ekak widihata enna puluwan (FormData eken) — parse karanawa
        let parsedItems;
        try {
            parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
        } catch {
            return res.status(400).json({ message: 'Items eka valid JSON array ekak thiyanama ona!' });
        }

        // Items array blank da check karanawa
        if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
            return res.status(400).json({ message: 'Order eke aduth food item ekak thiyanama ona!' });
        }

        // totalAmount positive number ekak da check karanawa
        const totalNum = Number(totalAmount);
        if (isNaN(totalNum) || totalNum <= 0) {
            return res.status(400).json({ message: 'Valid totalAmount ekak denna ona!' });
        }

        // Payment slip image path — Multer eken save welanam path eka gannawa
        // req.file naththam blank string — slip optional
        let paymentSlip = '';
        if (req.file) {
            // 'uploads/slips/slip-timestamp.jpg' wage relative path
            paymentSlip = req.file.path;
        }

        // Aluth Order document eka hadanawa
        const newOrder = new Order({
            userId: req.user.id,          // JWT eken — user tamper karanna baha
            restaurantId,
            items: parsedItems,
            totalAmount: totalNum,
            status: 'Pending',            // Default — manager wenas karanawa
            paymentSlip
        });

        const saved = await newOrder.save();

        // Save karapu order eka populate kara return karanawa
        const populated = await Order.findById(saved._id)
            .populate('userId', 'name email')
            .populate('riderId', 'name email')
            .populate('restaurantId', 'name address')
            .populate('items.foodId', 'name price');

        res.status(201).json({
            message: 'Order eka lassanata place una! 🎉',
            order: populated
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Order save weddi server eke aulk aawa.' });
    }
};

// =====================================================
// GET ORDERS — GET /api/orders
// Manager ta — okkoma orders (restaurant filter optional)
// Customer ta — own orders witharak
// items.foodId, userId, restaurantId okkoma populate karanawa
// =====================================================
exports.getOrders = async (req, res) => {
    try {
        let query = {};

        if (req.user.role === 'manager') {
            // Manager kenek ta okkoma orders — optional restaurantId query param filter
            if (req.query.restaurantId && mongoose.Types.ObjectId.isValid(req.query.restaurantId)) {
                query.restaurantId = req.query.restaurantId;
            }
            // restaurantId naha nam okkoma orders
        } else {
            // Customer/rider kenek ta own orders witharak
            query.userId = req.user.id;
        }

        const orders = await Order.find(query)
            .populate('userId', 'name email')
            .populate('riderId', 'name email')
            .populate('restaurantId', 'name address')
            .populate('items.foodId', 'name price image')
            .sort({ createdAt: -1 }); // Puthe order wattiya ones first

        res.json(orders);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Orders gannata server eke aulk aawa.' });
    }
};

// =====================================================
// GET ONE ORDER — GET /api/orders/:id
// Owner hari Manager witharak — eka order eke full details
// =====================================================
exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        // /:id eken "available" / "my-active-task" match unoth "Valid order ID" pennenna epa — rider list routes use karanna.
        const slug = String(id).toLowerCase();
        if (slug === 'available' || slug === 'my-active-task') {
            return res.status(404).json({
                message: `GET /api/orders/${slug} kiyana list endpoint eka use karanna — meka order-by-id naha.`,
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Valid order ID ekak denna!' });
        }

        const order = await Order.findById(id)
            .populate('userId', 'name email')
            .populate('riderId', 'name email')
            .populate('restaurantId', 'name address')
            .populate('items.foodId', 'name price image');

        if (!order) {
            return res.status(404).json({ message: 'Me ID eken order ekak naha!' });
        }

        // Owner hari manager witharak order balanna puluwan
        const isOwner  = String(order.userId._id || order.userId) === String(req.user.id);
        const isManager = req.user.role === 'manager';
        const isRider   = req.user.role === 'rider';
        const riderMatch =
            order.riderId &&
            String(order.riderId._id || order.riderId) === String(req.user.id);

        if (!isOwner && !isManager && !(isRider && riderMatch)) {
            return res.status(403).json({ message: 'Oya ta me order balanna permission naha!' });
        }

        res.json(order);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Order gannata server eke aulk aawa.' });
    }
};

// =====================================================
// UPDATE ORDER — PUT /api/orders/:id (body: items + totalAmount, slip optional)
// Manager approve karanna kalin customer ta order eka edit/delete karanna puluwan widihata condition eka damma.
// Pending witharak + order owner witharak wenas karanna puluwan.
// =====================================================
exports.updateOrder = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Valid order ID ekak denna!' });
        }

        if (req.user.role === 'manager') {
            return res.status(403).json({ message: 'Manager la me route eken order edit karanna baha!' });
        }

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: 'Me ID eken order ekak naha!' });
        }

        if (String(order.userId) !== String(req.user.id)) {
            return res.status(403).json({ message: 'Oya ta me order edit karanna permission naha!' });
        }

        if (order.status !== 'Pending') {
            return res.status(400).json({
                message: `Order eka '${order.status}' stage eke thiyenawa. Dan edit karanna baha!`
            });
        }

        const { items, totalAmount } = req.body;

        let parsedItems;
        try {
            parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
        } catch {
            return res.status(400).json({ message: 'Items eka valid JSON array ekak thiyanama ona!' });
        }

        if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
            return res.status(400).json({ message: 'Order eke aduth food item ekak thiyanama ona!' });
        }

        const totalNum = Number(totalAmount);
        if (isNaN(totalNum) || totalNum <= 0) {
            return res.status(400).json({ message: 'Valid totalAmount ekak denna ona!' });
        }

        order.items = parsedItems;
        order.totalAmount = totalNum;

        if (req.file) {
            order.paymentSlip = req.file.path;
        }

        await order.save();

        const populated = await Order.findById(order._id)
            .populate('userId', 'name email')
            .populate('riderId', 'name email')
            .populate('restaurantId', 'name address')
            .populate('items.foodId', 'name price image');

        res.json({
            message: 'Order eka update una! ✅',
            order: populated
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Order update weddi server eke aulk aawa.' });
    }
};

// =====================================================
// Member 5 — RIDER DELIVERY (Read / Assign / Status / Proof / Cancel)
// Member 5 ge delivery CRUD operations tika (Assign, Status Update, Proof of Delivery) okkoma ekapara iwara kala.
// JWT eke user id = req.user.id (mongoose ObjectId string)
// =====================================================

async function populateOrderDoc(query) {
    return query
        .populate('userId', 'name email phone')
        .populate('riderId', 'name email')
        .populate('restaurantId', 'name address')
        .populate('items.foodId', 'name price image');
}

// GET /api/orders/available — status === 'Ready' (unassigned rider)
// req.params.id check ekak naha — riderId null hari field nathi documents witharak.
// Route ordering prashne fix kala. /available route eka /:id ekata udin damma error eka ain karanna.
exports.getAvailableOrders = async (req, res) => {
    try {
        if (req.user.role !== 'rider') {
            return res.status(403).json({ message: 'Me endpoint eka rider kenek witharak!' });
        }

        // Ready + rider assign nathi: null (schema default) hari field eka nathi purana documents
        const orders = await populateOrderDoc(
            Order.find({
                status: 'Ready',
                $or: [{ riderId: null }, { riderId: { $exists: false } }],
            }).sort({ createdAt: 1 })
        );

        const list = Array.isArray(orders) ? orders : [];
        return res.status(200).json(list);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Available orders gannata server eke aulk aawa.' });
    }
};

// GET /api/orders/my-active-task — Delivery collection eken (deliveryController)
exports.getRiderActiveTask = deliveryController.getActiveDeliveryTask;

// PUT /api/orders/:id/assign — Order + aluth Delivery collection entry (Member 5)
exports.assignRider = async (req, res) => {
    try {
        if (req.user.role !== 'rider') {
            return res.status(403).json({ message: 'Order assign karanna rider kenek witharak!' });
        }

        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Valid order ID ekak denna!' });
        }

        const riderObjectId = req.user.id || req.user._id;

        const updated = await deliveryController.assignOrderToRider(id, riderObjectId);

        if (!updated) {
            return res.status(400).json({
                message:
                    'Me order eka dan assign wela naththam Ready naha — accept karanna baha!',
            });
        }

        const populated = await populateOrderDoc(Order.findById(updated._id));

        res.json({
            message: 'Delivery accept una! 🛵 (Delivery DB eke record ekak create una)',
            order: populated,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Assign weddi server eke aulk aawa.' });
    }
};

// PUT /api/orders/:id/delivery-status — Delivery collection + Order sync
// deliveryController.updateDeliveryStatus expects delivery._id in :id,
// but this order-route sends order._id — do a lookup first.
exports.updateDeliveryStatus = async (req, res) => {
    const { id: orderId } = req.params;
    if (!require('mongoose').Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ message: 'Valid order ID ekak denna!' });
    }
    const Delivery = require('../models/Delivery');
    const rk = req.user.id || req.user._id;
    const delivery = await Delivery.findOne({
        orderId,
        riderId: rk,
        status: { $ne: 'Delivered' },
    }).sort({ createdAt: -1 });

    if (!delivery) {
        return res.status(404).json({ message: 'Me order ekata active delivery record ekak naha!' });
    }
    req.params.id = String(delivery._id);
    return deliveryController.updateDeliveryStatus(req, res);
};

// PUT /api/orders/:id/delivery-proof — Multer + Delivered (order ID → delivery lookup)
exports.uploadProof = async (req, res) => {
    const { id: orderId } = req.params;
    if (!require('mongoose').Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ message: 'Valid order ID ekak denna!' });
    }
    const Delivery = require('../models/Delivery');
    const rk = req.user.id || req.user._id;
    const delivery = await Delivery.findOne({
        orderId,
        riderId: rk,
        status: { $ne: 'Delivered' },
    }).sort({ createdAt: -1 });

    if (!delivery) {
        return res.status(404).json({ message: 'Me order ekata active delivery record ekak naha!' });
    }
    req.params.id = String(delivery._id);
    if (!req.body) req.body = {};
    req.body.status = 'Delivered';
    return deliveryController.updateDeliveryStatus(req, res);
};

// PUT /api/orders/:id/cancel-delivery — Delivery doc DELETE + Order reset (order ID → delivery lookup)
exports.cancelDelivery = async (req, res) => {
    const { id: orderId } = req.params;
    if (!require('mongoose').Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ message: 'Valid order ID ekak denna!' });
    }
    const Delivery = require('../models/Delivery');
    const rk = req.user.id || req.user._id;
    const delivery = await Delivery.findOne({
        orderId,
        riderId: rk,
        status: { $ne: 'Delivered' },
    }).sort({ createdAt: -1 });

    if (!delivery) {
        return res.status(404).json({ message: 'Me order ekata active delivery record ekak naha!' });
    }
    req.params.id = String(delivery._id);
    return deliveryController.cancelDeliveryTask(req, res);
};

// =====================================================
// UPDATE STATUS — PUT /api/orders/:id/status
// Manager ta order status eka wenas karanna puluwan.
// Pending → Preparing → Ready — valid statuses witharak
// =====================================================
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Valid order ID ekak denna!' });
        }

        // Manager witharak status wenas karanna puluwan
        if (req.user.role !== 'manager') {
            return res.status(403).json({ message: 'Manager witharak status wenas karanna puluwan!' });
        }

        const { status } = req.body;

        const validStatuses = ['Pending', 'Preparing', 'Ready'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                message: `Status eka valid naha! Me wage danna: ${validStatuses.join(', ')}`
            });
        }

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: 'Me ID eken order ekak naha!' });
        }

        order.status = status;
        const updated = await order.save();

        res.json({
            message: `Order status eka '${status}' ekata update una! ✅`,
            order: updated
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Status update weddi server eke aulk aawa.' });
    }
};

// =====================================================
// DELETE ORDER — DELETE /api/orders/:id
// Manager approve karanna kalin customer ta order eka edit/delete karanna puluwan widihata condition eka damma.
// Order eka prepare karanna kalin (Pending thiyeddi) vitharai cancel karanna denne.
// Customer ta own Pending orders cancel karanna puluwan
// Preparing hari Ready naththam cancel karanna baha
// Manager ta eka order ekak delete karanna puluwan (any status)
// =====================================================
exports.deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Valid order ID ekak denna!' });
        }

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: 'Me ID eken order ekak naha!' });
        }

        const isOwner  = String(order.userId) === String(req.user.id);
        const isManager = req.user.role === 'manager';

        if (!isOwner && !isManager) {
            return res.status(403).json({ message: 'Oya ta me order cancel karanna permission naha!' });
        }

        // Customer kenek ta Pending witharak cancel karanna puluwan
        // Preparing / Ready — cancel karanna dena naha (manager witharak okke delete karanna puluwan)
        if (isOwner && !isManager && order.status !== 'Pending') {
            return res.status(400).json({
                message: `Order eka '${order.status}' stage eke thiyenawa. Dan cancel karanna baha!`
            });
        }

        await Order.findByIdAndDelete(id);

        res.json({ message: 'Order eka cancel una! 🗑️' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Order delete weddi server eke aulk aawa.' });
    }
};

/*
 * Mul sangrahaya (Sinhala):
 * createOrder  — Bank slip + items FormData eken save karanawa. userId JWT eken.
 * getOrders    — Manager ta okkoma (filter opt.), customer ta own orders.
 * getOrderById — Owner hari manager witharak.
 * updateOrder  — Customer owner, Pending witharak — items/total/slip.
 * updateStatus      — Manager witharak — Pending/Preparing/Ready.
 * Rider: getAvailableOrders, getRiderActiveTask, assignRider (+ Delivery.create), updateDeliveryStatus, uploadProof, cancelDelivery → deliveryController.
 * deleteOrder — Customer ta Pending witharak; manager ta any status.
 */
