// =====================================================
// foodController.js — Member 3: Food Item Management
// MVC eke Controller layer — Food CRUD logic methata
//
// Member 3 ge CRUD:
//   CREATE → addFood()       POST   /api/food/add
//   READ   → getAllFoods()   GET    /api/food
//   UPDATE → updateFood()    PUT    /api/food/:id
//   DELETE → deleteFood()    DELETE /api/food/:id
//
// Member 2 Restaurant model ekata restaurantId eken link
// Multer — image upload karanawa (uploads/ folder)
// =====================================================

// mongoose — ObjectId validate karanawa
const mongoose = require('mongoose');

// Member 3 — Food collection ekata access
const Food = require('../models/Food');

// Member 2 — restaurantId validate karanawa (restaurant exist da check)
const Restaurant = require('../models/Restaurant');

// =====================================================
// HELPER FUNCTION — resolveRestaurantId()
// Body eken ena restaurantId eka validate kara MongoDB ObjectId return karanawa
// Valid ID + DB eke found naththam error object return
// null/empty naththam null return (restaurant link optional was made required in schema)
// =====================================================
async function resolveRestaurantId(restaurantIdRaw) {
    // 1. Empty / null / undefined naththam null return (no link)
    if (restaurantIdRaw === undefined || restaurantIdRaw === null || restaurantIdRaw === '') {
        return null;
    }

    // 2. String conversion + trim
    const idStr = String(restaurantIdRaw).trim();

    // 3. Valid MongoDB ObjectId format da check (24-char hex)
    if (!mongoose.Types.ObjectId.isValid(idStr)) {
        return { error: 'The provided restaurantId is not a valid MongoDB ObjectId.' };
    }

    // 4. DB eke actually thiyanawada check — ID valid naththam restaurant naha puluwan
    const found = await Restaurant.findById(idStr);
    if (!found) {
        return { error: 'No restaurant was found for the provided restaurantId.' };
    }

    // 5. Valid ObjectId string return — Food schema cast karanawa
    return idStr;
}

// =====================================================
// CREATE — POST /api/food/add  (or POST /api/food/)
// Member 3: Aluth food item ekak add karanawa
// Manager role required (routes file eke onlyManager middleware)
// Body: name, description, price, category, restaurantId (text fields)
// file: image (Multer — single file 'image' field)
// =====================================================
exports.addFood = async (req, res) => {
    try {
        // 1. Request body eken fields extract
        const { name, description, price, category, restaurantId } = req.body;

        // 2. Required field validation
        if (!name || price === undefined || price === '' || !category) {
            return res.status(400).json({ message: "Name, price, and category are required." });
        }

        // 3. Price numeric validation — negative / NaN allow naha
        const priceNum = Number(price);
        if (Number.isNaN(priceNum) || priceNum < 0) {
            return res.status(400).json({ message: "Please provide a valid numeric price." });
        }

        // 4. restaurantId validate — Member 2 restaurant ekata link
        const restaurantRef = await resolveRestaurantId(restaurantId);
        if (restaurantRef && restaurantRef.error) {
            return res.status(400).json({ message: restaurantRef.error });
        }

        // 5. Image path — Multer eken save wunanam path set; naththam empty
        let imagePath = '';
        if (req.file) {
            imagePath = req.file.path;
        }

        // 6. Food document create karanawa
        const newFood = new Food({
            name: String(name).trim(),
            description: description != null ? String(description).trim() : '',
            price: priceNum,
            category: String(category).trim(),
            image: imagePath,
            restaurantId: restaurantRef || null // Member 2 restaurant link
        });

        // 7. DB ekata save
        const savedFood = await newFood.save();

        // 8. Populate restaurant details — response eke restaurant name/logo pennawa
        const foodWithRestaurant = await Food.findById(savedFood._id).populate(
            'restaurantId',
            'name address logo workingHours'
        );

        // 9. Success response
        res.status(201).json({
            message: "Food item added successfully.",
            food: foodWithRestaurant
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "A server error occurred while adding the food item." });
    }
};

// =====================================================
// READ ALL — GET /api/food
// Member 3: Okkoma food items list + restaurant details
// Public route — login naththam balanna puluwan (Home screen eke food list)
// .populate('restaurantId') — restaurant name/logo frontend eke pennawa
// =====================================================
exports.getAllFoods = async (req, res) => {
    try {
        // 1. Okkoma Food documents gannawa + restaurantId populate
        // sort createdAt -1 → newest first
        const foods = await Food.find()
            .populate('restaurantId', 'name address logo workingHours')
            .sort({ createdAt: -1 });

        // 2. Array return
        res.json(foods);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "A server error occurred while retrieving food items." });
    }
};

// =====================================================
// UPDATE — PUT /api/food/:id
// Member 3: Food item eke details wenas karanawa
// Manager only (onlyManager middleware); JWT required
// Partial update — field naththam existing value keep karanawa
// =====================================================
exports.updateFood = async (req, res) => {
    try {
        // 1. URL params eken food id gannawa
        const { name, description, price, category, restaurantId } = req.body;

        // 2. Existing food find — id naha naththam 404
        const existingFood = await Food.findById(req.params.id);
        if (!existingFood) {
            return res.status(404).json({ message: "No food item was found for the provided ID." });
        }

        // 3. Image — new file upload naththam existing path keep
        let imagePath = existingFood.image;
        if (req.file) {
            imagePath = req.file.path;
        }

        // 4. restaurantId — body eke denna naththam existing link keep
        let restaurantRef = existingFood.restaurantId;
        if (restaurantId !== undefined) {
            const resolved = await resolveRestaurantId(restaurantId);
            if (resolved && resolved.error) {
                return res.status(400).json({ message: resolved.error });
            }
            restaurantRef = resolved; // null hari valid id
        }

        // 5. Price — denna naththam existing price keep
        const priceNum = price !== undefined && price !== '' ? Number(price) : existingFood.price;

        // 6. Update object build — undefined naththam existing value
        const updatedData = {
            name: name != null ? String(name).trim() : existingFood.name,
            description: description != null ? String(description).trim() : existingFood.description,
            price: Number.isNaN(priceNum) ? existingFood.price : priceNum,
            category: category != null ? String(category).trim() : existingFood.category,
            image: imagePath,
            restaurantId: restaurantRef
        };

        // 7. DB update — returnDocument: 'after' = updated doc return; populate restaurant
        const updatedFood = await Food.findByIdAndUpdate(
            req.params.id,
            updatedData,
            { returnDocument: 'after' }
        ).populate('restaurantId', 'name address logo workingHours');

        // 8. Success response
        res.json({
            message: "Food item updated successfully.",
            food: updatedFood
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "A server error occurred while updating the food item." });
    }
};

// =====================================================
// DELETE — DELETE /api/food/:id
// Member 3: Food item ekak database eken ain karanawa
// Manager only; JWT required
// =====================================================
exports.deleteFood = async (req, res) => {
    try {
        // 1. Food find + validate
        const food = await Food.findById(req.params.id);
        if (!food) {
            return res.status(404).json({ message: "No food item was found for the provided ID." });
        }

        // 2. Delete
        await Food.findByIdAndDelete(req.params.id);

        // 3. Success
        res.json({ message: "Food item deleted successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "A server error occurred while deleting the food item." });
    }
};

/*
 * =====================================================
 * File mul sangrahaya — Viva reference
 * =====================================================
 * Member 3 — Food Management:
 *   addFood()       POST   /api/food/add  → Manager; Multer image + restaurantId validate
 *   getAllFoods()   GET    /api/food      → Public; populate restaurant details
 *   updateFood()    PUT    /api/food/:id  → Manager; partial update (keep existing fields)
 *   deleteFood()    DELETE /api/food/:id  → Manager; simple findByIdAndDelete
 *
 * Member connections:
 *   Member 2 (Restaurant) → resolveRestaurantId() eken validate
 *   Member 4 (Order) → items[].foodId eken Food ekata link
 *   Member 6 (Review) → foodId eken Food ekata link
 *   RestaurantDetailScreen → food list by restaurant
 *   Cart → food item add karanawa; foodId + price save wenawa
 *
 * resolveRestaurantId() helper:
 *   empty/null → null (no link)
 *   invalid ObjectId → 400 error
 *   valid but not found → 400 error
 *   valid + found → ObjectId string return
 */
