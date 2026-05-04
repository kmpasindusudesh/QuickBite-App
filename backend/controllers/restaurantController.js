// =====================================================
// restaurantController.js — Member 2: Restaurant Management
// MVC eke Controller layer — routes file eka clean, logic methata
//
// Member 2 ge CRUD:
//   CREATE → createRestaurant()    POST   /api/restaurants
//   READ   → getAllRestaurants()   GET    /api/restaurants
//   READ   → getRestaurantById()   GET    /api/restaurants/:id
//   UPDATE → updateRestaurant()    PUT    /api/restaurants/:id
//   DELETE → deleteRestaurant()    DELETE /api/restaurants/:id
//
// Multer — logo image upload karanawa (uploads/ folder)
// Member 3 Food items walata restaurantId eken link wenawa
// =====================================================

// mongoose — ObjectId validate karanawa (invalid ID ekata DB query karanna epa)
const mongoose = require('mongoose');

// Restaurant model — DB collection ekata access
const Restaurant = require('../models/Restaurant');

// Food model — delete karaddi linked food check karanawa
const Food = require('../models/Food');

// =====================================================
// CREATE — POST /api/restaurants
// Member 2: Aluth restaurant ekak add karanawa
// Body: name, address, workingHours (text); logo (multipart — optional)
// =====================================================
exports.createRestaurant = async (req, res) => {
    try {
        // 1. Request body eken text fields gannawa
        const { name, address, workingHours } = req.body;

        // 2. Required fields validate
        if (!name || !address) {
            return res.status(400).json({ message: 'Name and address are required.' });
        }

        // 3. Logo image path — Multer file upload welanam path set; naththam blank
        // path.posix.join — Windows eke backslash problem avoid
        let logoPath = '';
        if (req.file) {
            logoPath = req.file.path;
        }

        // 4. Aluth Restaurant document create karanawa
        const newRestaurant = new Restaurant({
            name: String(name).trim(),
            address: String(address).trim(),
            workingHours: workingHours != null ? String(workingHours).trim() : '',
            logo: logoPath
        });

        // 5. DB ekata save karanawa
        const saved = await newRestaurant.save();

        // 6. Success response + saved document return
        res.status(201).json({
            message: 'Restaurant added successfully.',
            restaurant: saved
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'A server error occurred while adding the restaurant.' });
    }
};

// =====================================================
// READ ALL — GET /api/restaurants
// Member 2: Okkoma restaurants list ekak return karanawa
// Public route — JWT naha (Home screen eke pennanna ona)
// =====================================================
exports.getAllRestaurants = async (req, res) => {
    try {
        // 1. Filter naha — okkoma documents gannawa (empty object = all)
        const restaurants = await Restaurant.find({});

        // 2. Array return karanawa
        res.json(restaurants);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'A server error occurred while retrieving restaurants.' });
    }
};

// =====================================================
// READ ONE — GET /api/restaurants/:id
// Member 2: URL eke ID eken eka restaurant eke details gannawa
// Restaurant detail screen ekata navigate karakotat use wenawa
// =====================================================
exports.getRestaurantById = async (req, res) => {
    try {
        // 1. URL params eken id gannawa
        const { id } = req.params;

        // 2. Valid ObjectId da check — invalid naththam DB query karanna epa
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'The provided restaurant ID is invalid.' });
        }

        // 3. DB eken find karanawa
        const restaurant = await Restaurant.findById(id);
        if (!restaurant) {
            return res.status(404).json({ message: 'No restaurant was found for the provided ID.' });
        }

        // 4. Restaurant document return karanawa
        res.json(restaurant);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'A server error occurred while retrieving the restaurant.' });
    }
};

// =====================================================
// UPDATE — PUT /api/restaurants/:id
// Member 2: Restaurant details wenas karanawa (name, address, workingHours, logo)
// JWT + Manager role required (onlyManager middleware — routes file eke)
// =====================================================
exports.updateRestaurant = async (req, res) => {
    try {
        // 1. URL eken id validate
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'The provided restaurant ID is invalid.' });
        }

        // 2. Body eken new values gannawa
        const { name, address, workingHours } = req.body;

        // 3. Existing restaurant find — id valid naththam naha message
        const existing = await Restaurant.findById(id);
        if (!existing) {
            return res.status(404).json({ message: 'No restaurant was found for the provided ID.' });
        }

        // 4. Logo path — file upload wunanam new path; naththam existing path keep
        let logoPath = existing.logo;
        if (req.file) {
            logoPath = req.file.path;
        }

        // 5. Update object — field naththam existing value keep (partial update support)
        const updatedData = {
            name: name != null ? String(name).trim() : existing.name,
            address: address != null ? String(address).trim() : existing.address,
            workingHours: workingHours != null ? String(workingHours).trim() : existing.workingHours,
            logo: logoPath
        };

        // 6. DB eke update karanawa — returnDocument: 'after' = updated document return
        const updated = await Restaurant.findByIdAndUpdate(id, updatedData, { returnDocument: 'after' });

        res.json({
            message: 'Restaurant updated successfully.',
            restaurant: updated
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'A server error occurred while updating the restaurant.' });
    }
};

// =====================================================
// DELETE — DELETE /api/restaurants/:id
// Member 2: Restaurant ekak database eken ain karanawa
// Data integrity check: Me restaurant ekakata linked Food items thiyanawada?
// Thiyanam — delete allow karanna baha (Food orphan wenawa naththam)
// =====================================================
exports.deleteRestaurant = async (req, res) => {
    try {
        // 1. ID validate
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'The provided restaurant ID is invalid.' });
        }

        // 2. Restaurant DB eke thiyenawada check
        const restaurant = await Restaurant.findById(id);
        if (!restaurant) {
            return res.status(404).json({ message: 'No restaurant was found for the provided ID.' });
        }

        // 3. IMPORTANT: Food items linked nawada check
        // Member 3 Food items me restaurantId use karanawa — delete kala naththam orphan records enawa
        const linkedFood = await Food.findOne({ restaurantId: id });
        if (linkedFood) {
            return res.status(400).json({
                message: 'Cannot delete restaurant with linked food items. Please remove the linked foods first.'
            });
        }

        // 4. Safe to delete — no linked foods
        await Restaurant.findByIdAndDelete(id);

        res.json({ message: 'Restaurant deleted successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'A server error occurred while deleting the restaurant.' });
    }
};

/*
 * =====================================================
 * File mul sangrahaya — Viva reference
 * =====================================================
 * Member 2 — Restaurant Management:
 *   createRestaurant()    POST    → Multer logo + DB save
 *   getAllRestaurants()   GET     → Public; all restaurants
 *   getRestaurantById()   GET/:id → Public; single restaurant
 *   updateRestaurant()    PUT/:id → Manager; Multer logo optional
 *   deleteRestaurant()    DELETE  → Manager; linked food check first
 *
 * Member connections:
 *   Member 3 (Food) → restaurantId eken me Restaurant ekata link
 *   Member 4 (Order) → restaurantId eken me Restaurant ekata link
 *   Home screen → getAllRestaurants() eken list pennawa
 *   Restaurant Detail screen → getRestaurantById() eken data pennawa
 */
