// =====================================================
// authController.js — Member 1: User Management
// MVC pattern eke "Controller" layer eka
// Routes file eka clean thabanawa — okkoma business logic methata
//
// Member 1 ge CRUD:
//   CREATE  → register()         — aluth account ekak hadanawa
//   READ    → getProfile()       — JWT eken user data gannawa
//   UPDATE  → updateUser()       — name / email / phone wenas karanawa
//   UPDATE  → uploadProfilePic() — profile photo change karanawa
//   DELETE  → deleteUser()       — account database eken ain karanawa
//   READ    → login()            — JWT token denawa (auth entry point)
// =====================================================

// bcryptjs — Password hash karanawa saha compare karanawa (plain text save karanna baha!)
const bcrypt = require('bcryptjs');

// jsonwebtoken — Login success unoth JWT token eka create karanawa
const jwt = require('jsonwebtoken');

// User model eka — Member 1 User collection ekata access
const User = require('../models/User');

// =====================================================
// REGISTER — POST /api/auth/register
// Member 1: Aluth user kenekuta account ekak hadanawa
// =====================================================
exports.register = async (req, res) => {
    try {
        // 1. Request body eken data gannawa
        const { name, password, role } = req.body;
        // Email eka lowercase + trim — consistent save karanawa
        const email = (req.body.email || '').trim().toLowerCase();
        // Sri Lanka mobile — 07XXXXXXXX wage 10 digits (optional)
        const phone = (req.body.phone || '').trim();

        // 2. Phone denna thibboth 10-digit check
        if (phone && !/^\d{10}$/.test(phone)) {
            return res.status(400).json({ message: "Phone number must contain exactly 10 digits." });
        }

        // 3. Email duplicate check — eka email eken eka account ekai
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "This email address is already in use." });
        }

        // 4. Password hash karanawa — plain text DB ekata yanna baha
        // bcrypt.genSalt(10) — 10 rounds (secure enough + not too slow)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 5. Aluth User document eka hadanawa
        const newUser = new User({
            name,
            email,
            password: hashedPassword, // Hashed only — never plain text
            role: role || 'customer',  // Default: customer; manager/rider role manually assign
            phone
        });

        // 6. Database ekata save karanawa
        await newUser.save();

        // 7. Success response — token dennawa naha (register eka witirak; login karanna ona)
        res.status(201).json({ message: "User registered successfully." });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "A server error occurred. Please try again." });
    }
};

// =====================================================
// LOGIN — POST /api/auth/login
// Member 1: Email + password validate kara JWT token eka denawa
// Frontend me token eka AsyncStorage ekata save karanawa — future API calls walata use karanawa
// =====================================================
exports.login = async (req, res) => {
    try {
        // 1. Request body eken email + password gannawa
        const { password } = req.body;
        // Register eke widihata lowercase match wenna — case sensitive wenna epa
        const email = (req.body.email || '').trim().toLowerCase();

        // 2. Email database eke thiyenawada balanawa
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "No account was found for this email address." });
        }

        // 3. Password compare — plain text vs stored hash
        // bcrypt.compare plain text eka hash ekakata compare karanawa (secret reveal naha)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect password." });
        }

        // 4. JWT token eka create karanawa
        // Payload: { id, role } — protect middleware eken decode karanawa (req.user = payload)
        // JWT_SECRET .env eke thiyenawa — public karanna baha!
        // expiresIn: '1d' — 24 parak valid, passe login karanna ona (security)
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // 5. Token + user info frontend ekata yawanawa
        // Frontend AsyncStorage eke save karanawa (storage.js eke saveToken / saveUser)
        res.json({
            message: "Login successful.",
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,    // 'customer' | 'manager' | 'rider' — tab layout role-based navigation walata
                phone: user.phone || ''
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "A server error occurred. Please try again." });
    }
};

// =====================================================
// GET PROFILE — GET /api/auth/profile
// Member 1: JWT eken user id gena DB eken profile data gannawa
// protect middleware eken req.user set wenawa — controller ta clean data
// =====================================================
exports.getProfile = async (req, res) => {
    try {
        // 1. req.user.id — JWT eke decoded id eka (protect middleware eken set)
        // .select('-password') — password field return karanna epa (security!)
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // 2. Full user object return (password naththama)
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// =====================================================
// UPDATE USER — PUT /api/auth/update
// Member 1: Profile text fields update karanawa (name, email, phone)
// JWT required — own profile witharak update karanna puluwan
// =====================================================
exports.updateUser = async (req, res) => {
    try {
        // 1. Request body eken new values gannawa
        const { name, email } = req.body;
        // phone undefined nam skip; string nam trim
        const phone = req.body.phone !== undefined ? String(req.body.phone).trim() : undefined;

        // 2. Name + email required validation
        if (!name || !email) {
            return res.status(400).json({ message: "Name and email are required." });
        }

        // 3. Phone validate — blank eka valid (clear phone); filled naththam 10 digits ona
        if (phone !== undefined && phone !== '' && !/^\d{10}$/.test(phone)) {
            return res.status(400).json({ message: "Phone number must contain exactly 10 digits." });
        }

        // 4. Email duplicate check — wenath kenek me email use karanawada? (mage account nathara)
        const emailTaken = await User.findOne({
            email: email.trim().toLowerCase(),
            _id: { $ne: req.user.id } // $ne = "not equal" — me user eka exclude karanawa
        });
        if (emailTaken) {
            return res.status(400).json({ message: "This email address is already associated with another account." });
        }

        // 5. Update object hadanawa — phone field optional
        const updateFields = {
            name: name.trim(),
            email: email.trim().toLowerCase(),
        };
        if (phone !== undefined) updateFields.phone = phone;

        // 6. DB eke update karanawa; aluth document return karanawa (returnDocument: 'after')
        // runValidators: true — schema validate run wenawa (min/max etc.)
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            updateFields,
            { returnDocument: 'after', runValidators: true }
        ).select('-password'); // Password return karanna epa

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found." });
        }

        // 7. Success response
        res.json({
            message: "Profile updated successfully.",
            user: updatedUser
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "A server error occurred while updating the profile." });
    }
};

// =====================================================
// DELETE USER — DELETE /api/auth/delete
// Member 1: Own account database eken ain karanawa
// JWT required — vedaganna witharak own account delete karanna puluwan
// =====================================================
exports.deleteUser = async (req, res) => {
    try {
        // 1. JWT eke user id eken DB eken find + delete
        const deleted = await User.findByIdAndDelete(req.user.id);
        if (!deleted) {
            return res.status(404).json({ message: "User not found." });
        }

        // 2. Success — frontend logout karanna ona (token still valid 1d — AsyncStorage clear karanna ona)
        res.json({ message: "Account deleted successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "A server error occurred while deleting the account." });
    }
};

// =====================================================
// PROFILE PHOTO UPLOAD — PUT /api/auth/profile-pic
// Member 1: Cloudinary Multer eken photo eka upload wenawa
// req.file.path — Cloudinary eken ena full image URL
// DB eke full URL save karanawa — legacy relative paths backwards compat frontend eke
// =====================================================
exports.uploadProfilePic = async (req, res) => {
    try {
        // 1. File upload wunada check — Multer filter reject kala naththam req.file naha
        if (!req.file) {
            return res.status(400).json({ message: "No photo was selected." });
        }

        // 2. Relative path hadanawa — "uploads/filename.jpg" wage
        // path.posix.join — Windows eke backslash wenawa naha (forward slash use)
        // Cloudinary: req.file.path eke full URL — DB ekata athulata save karanawa
        const relativePath = req.file.path;

        // 3. DB eke profilePic field update karanawa
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { profilePic: relativePath },
            { returnDocument: 'after' }
        ).select('-password');

        // 4. Success — frontend SERVER_URL + '/' + profilePic eken image URL hadanawa
        res.json({
            message: "Profile photo uploaded successfully.",
            user: updatedUser
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "A server error occurred while uploading the photo." });
    }
};

/*
 * =====================================================
 * File mul sangrahaya — Viva reference
 * =====================================================
 * Member 1 — User Management:
 *   register()         POST /api/auth/register   → bcrypt hash + DB save
 *   login()            POST /api/auth/login       → bcrypt compare + JWT sign
 *   getProfile()       GET  /api/auth/profile     → JWT decode + DB find
 *   updateUser()       PUT  /api/auth/update      → email duplicate + DB update
 *   deleteUser()       DELETE /api/auth/delete    → DB findByIdAndDelete
 *   uploadProfilePic() PUT  /api/auth/profile-pic → Multer file + DB path save
 *
 * Security notes:
 *   - Password never stored plain — bcrypt hash (10 rounds)
 *   - JWT secret .env eke — never hardcode
 *   - .select('-password') — DB response walata password field remove
 *   - protect middleware — req.user JWT eken set
 */
