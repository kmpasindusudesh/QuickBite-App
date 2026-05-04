// =====================================================
// reviewController.js — Member 6: General Feedback System
// MVC Controller — Review CRUD logic
//
// Member 6: Food ekak select karanne nathuwa general review ekak danna puluwan widihata
// logic eka update kala. Meka app eke general feedback system eka widihata wada karanawa.
//
// Member 6 ge CRUD:
//   READ   → getReviews()    GET  /api/reviews          (public; ?foodId= optional filter)
//   CREATE → createReview()  POST /api/reviews           (JWT; foodId optional; no duplicate block)
//   UPDATE → updateReview()  PUT  /api/reviews/:id      (owner only; optional image)
//   DELETE → reviewRoutes.js eke inline function       (owner or manager)
//
// foodId optional — foodId naththam general feedback; thiyanam specific food ekakata link
// Duplicate check remove kala — general feedback system ekata restriction naha
// =====================================================

// mongoose — ObjectId validate karanawa + Review model operations
const mongoose = require('mongoose');

// Review model — DB collection ekata access
const Review = require('../models/Review');

// Food model — foodId valid da + food exist da check karanawa
const Food = require('../models/Food');

// =====================================================
// READ ALL — GET /api/reviews
// Member 6: Okkoma reviews hari ?foodId= filter ekak denna puluwan
// Public route — login naththam balanna puluwan
// Manager dashboard eke + Customer global feed dekenma use karanawa
// =====================================================
exports.getReviews = async (req, res) => {
    try {
        // 1. Query param eken foodId gannawa (optional)
        const foodIdQ = req.query.foodId;

        // 2. Filter object hadanawa
        const filter = {};
        if (
            foodIdQ != null &&               // foodId denna thibboth
            String(foodIdQ).trim() !== '' && // empty string naha
            mongoose.Types.ObjectId.isValid(String(foodIdQ)) // valid ObjectId
        ) {
            filter.foodId = String(foodIdQ); // filter set karanawa
        }
        // filter empty naththam okkoma reviews; set naththam me food ekakata witharak

        // 3. DB query + populate
        // .populate('userId', 'name') — userId string ekata user name object
        // .populate('foodId', 'name') — foodId string ekata food name object
        // .sort({ createdAt: -1 }) — newest first
        const reviews = await Review.find(filter)
            .populate('userId', 'name')
            .populate('foodId', 'name')
            .sort({ createdAt: -1 });

        // 4. Array return
        return res.status(200).json(reviews);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'A server error occurred while retrieving reviews.' });
    }
};

// =====================================================
// CREATE — POST /api/reviews
// Member 6: Aluth review ekak submit karanawa
// JWT required — userId JWT eken auto gannawa (tamper karanna baha)
// Body: rating (1-5), comment (optional), foodId (optional)
// file: reviewImage (optional — Multer, field name: 'reviewImage')
// =====================================================
exports.createReview = async (req, res) => {
    try {
        // 1. Body eken data gannawa
        const { foodId, rating, comment } = req.body;

        // 2. Rating validate — 1 idan 5 dakwa valid
        const ratingNum = Number(rating);
        if (!rating || Number.isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
        }

        if (!comment || String(comment).trim() === '') {
            return res.status(400).json({ message: 'Comment is required.' });
        }

        // 3. foodId optional handling
        let foodIdToSave;
        const hasFood = foodId != null && String(foodId).trim() !== '';

        if (hasFood) {
            // 3a. foodId valid ObjectId da check
            if (!mongoose.Types.ObjectId.isValid(String(foodId))) {
                return res.status(400).json({ message: 'The provided foodId is invalid.' });
            }

            // 3b. Food DB eke thiyenawada check
            const food = await Food.findById(foodId);
            if (!food) {
                return res.status(404).json({ message: 'No food item was found for the provided foodId.' });
            }
            foodIdToSave = foodId;

            // General feedback system: duplicate check remove kala.
            // Eka user eka food ekakata multiple times feedback danna puluwan.
        }

        // 4. Image path — Multer eken file save wunanam path set (Cloudinary)
        let imagePath = '';
        if (req.file) {
            imagePath = req.file.path; // Cloudinary eken ena full URL eka methanata enawa
        }

        // 5. Review document build
        // userId JWT eken auto — req.user.id (protect middleware eken)
        const doc = {
            userId:  req.user.id, // JWT eken — user tamper karanna baha
            rating:  ratingNum,
            comment: comment ? String(comment).trim() : '',
            image:   imagePath,
        };
        // foodId thiyanam add; naththam general review (no foodId field)
        if (foodIdToSave) {
            doc.foodId = foodIdToSave;
        }

        // 6. DB ekata save
        const saved = await new Review(doc).save();

        // 7. Populate + return
        const populated = await Review.findById(saved._id)
            .populate('userId', 'name')
            .populate('foodId', 'name');

        return res.status(201).json({
            message: 'Review submitted successfully.',
            review:  populated,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'A server error occurred while submitting feedback.' });
    }
};

// =====================================================
// UPDATE — PUT /api/reviews/:id
// Member 6: Own review eka wenas karanawa (rating, comment, optional image)
// JWT required + owner check — wenath kenekage review edit karanna baha
// =====================================================
exports.updateReview = async (req, res) => {
    try {
        // 1. URL param eken review id gannawa
        const { id } = req.params;

        // 2. Valid ObjectId da check
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Please provide a valid review ID.' });
        }

        // 3. Review DB eke find
        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found.' });
        }

        // 4. Owner check — JWT eke user id == review.userId da?
        // String() convert — ObjectId vs string mismatch avoid
        const jwtUserId = String(req.user?.id || req.user?._id || '');
        if (String(review.userId) !== jwtUserId) {
            return res.status(403).json({ message: 'You are only authorized to update your own review.' });
        }

        // 5. Rating validate — update naththam existing keep
        const { rating, comment } = req.body;
        const ratingNum =
            rating !== undefined && rating !== '' ? Number(rating) : review.rating;
        if (Number.isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
        }

        const nextComment =
            comment !== undefined ? String(comment).trim() : String(review.comment || '').trim();
        if (nextComment === '') {
            return res.status(400).json({ message: 'Comment is required.' });
        }

        // 6. Image — new file upload naththam existing image path keep
        let imagePath = review.image;
        if (req.file) {
            imagePath = req.file.path;
        }

        // 7. Update fields
        const updatedFields = {
            rating:  ratingNum,
            comment: nextComment,
            image:   imagePath,
        };

        // 8. DB update + populate return
        const updated = await Review.findByIdAndUpdate(id, updatedFields, { new: true })
            .populate('userId', 'name')
            .populate('foodId', 'name');

        return res.json({
            message: 'Review updated successfully.',
            review:  updated,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'A server error occurred while updating the review.' });
    }
};

/*
 * =====================================================
 * File mul sangrahaya — Viva reference
 * =====================================================
 * Member 6 — Reviews & Ratings:
 *   getReviews()    GET  /api/reviews          → Public; ?foodId= filter optional
 *   createReview()  POST /api/reviews           → JWT; rating validate; no duplicate block (general feedback)
 *   updateReview()  PUT  /api/reviews/:id      → Owner only; partial update
 *   (delete inline in reviewRoutes.js)          → Owner or Manager
 *
 * Member connections:
 *   Member 1 (User)  → userId JWT eken auto; populate name
 *   Member 3 (Food)  → foodId optional; validate food exists
 *   Manager Dashboard → getReviews() + delete (moderation)
 *   FoodDetailScreen → getReviews(?foodId=) + averageRating
 *   ReviewScreen     → createReview() + updateReview()
 *
 * Security:
 *   - userId JWT eken — user tamper karanna baha
 *   - Owner check → String() compare (ObjectId vs string safe)
 *   - Duplicate restrict naha — general feedback system eke multiple reviews OK
 */
