// =====================================================
// server.js — QuickBite Backend Entry Point
// Node.js + Express server eka start karana main file
//
// Me file eke:
//   1. Express app setup (CORS, JSON middleware)
//   2. Static file serving (uploads/ folder)
//   3. All API routes register
//   4. MongoDB connect
//   5. Server start (port 5000)
//
// Members ge API routes:
//   Member 1 → /api/auth        (User auth + profile)
//   Member 2 → /api/restaurants (Restaurant CRUD)
//   Member 3 → /api/food        (Food item CRUD)
//   Member 4 → /api/orders      (Order management)
//   Member 5 → /api/deliveries  (Delivery tasks)
//   Member 6 → /api/reviews     (Reviews + ratings)
// =====================================================

// express — Web framework (HTTP server + routing)
const express = require('express');

// path — File system path cross-platform handle
const path = require('path');

// mongoose — MongoDB ODM (Object Document Mapper)
const mongoose = require('mongoose');

// cors — Cross-Origin Resource Sharing
// React Native / Expo eken different origin (phone IP) → server request karanawa
// CORS naha naththam browser / Expo block karanawa
const cors = require('cors');

// dotenv — .env file eke thiyena environment variables load karanawa
// JWT_SECRET, MONGO_URI me eken gannawa (hardcode naha — security!)
require('dotenv').config();

// Express app instance hadanawa
const app = express();

// =====================================================
// MIDDLEWARE SETUP
// Middleware = request + response walata kalin run wena functions
// =====================================================

// CORS middleware — okkoma origins allow (development)
// Production walata specific origins restrict karanawa
app.use(cors());

// JSON middleware — request body eke JSON parse karanawa
// req.body use karanna meka ona (body-parser included in express 4.x+)
app.use(express.json());

// Static file serving — uploads/ folder images pennawa
// Phone eken: http://SERVER_IP:5000/uploads/filename.jpg → image
// DB eke relative path + SERVER_URL → full image URL hadanawa
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =====================================================
// ROUTES REGISTER
// Each Member ge routes eka methata register karanawa
// app.use('/api/path', routerFile) — prefix + router connect
// =====================================================

// Member 1 — User Authentication & Profile
// POST /register, POST /login, GET /profile, PUT /update, DELETE /delete, PUT /profile-pic
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Member 2 — Restaurant Management
// CRUD: /api/restaurants (GET public, others Manager only)
const restaurantRoutes = require('./routes/restaurantRoutes');
app.use('/api/restaurants', restaurantRoutes);

// Member 3 — Food Item Management
// CRUD: /api/food (GET public, others Manager only + Multer)
const foodRoutes = require('./routes/foodRoutes');
app.use('/api/food', foodRoutes);

// Member 4 — Order Management (+ Member 5 backward compat routes)
// Customer: POST (place order), GET (own orders), PUT (edit Pending), DELETE (cancel)
// Manager: GET all, PUT status (Preparing/Ready)
// Rider: GET available + active, PUT assign/delivery-status/proof/cancel
const orderRoutes = require('./routes/orderRoutes');
app.use('/api/orders', orderRoutes);

// Member 5 — Delivery Task Management (independent Deliveries collection)
// Rider CRUD: POST (accept), GET (own list), PUT (status + proof), DELETE (cancel)
const deliveryRoutes = require('./routes/deliveryRoutes');
app.use('/api/deliveries', deliveryRoutes);

// Member 6 — Reviews & Ratings
// POST (create), GET (list; ?foodId= filter), GET /food/:foodId, PUT (update), DELETE (owner/manager)
const reviewRoutes = require('./routes/reviewRoutes');
app.use('/api/reviews', reviewRoutes);

// =====================================================
// MONGODB CONNECTION
// MONGO_URI .env eke thiyenawa (mongodb+srv://... Atlas hari localhost)
// =====================================================
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Niyamai! MongoDB Database ekata connect una! 🎉');

    })
    .catch((error) => {
        console.log('Apoo, Database eka connect weddi aulk aawa:', error);
    });

// =====================================================
// TEST ROUTE — Root path (health check)
// Browser/Postman eken http://localhost:5000 → confirmation message
// =====================================================
app.get('/', (req, res) => {
    res.send("QuickBite Backend eka supiriyata wada karanawa!");
});

// =====================================================
// SERVER START — Port 5000
// Phone same network → http://YOUR_IP:5000/api/...
// =====================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server eka start una... Port eka: ${PORT}`);
});

/*
 * =====================================================
 * File mul sangrahaya — Viva reference
 * =====================================================
 * Server startup order:
 *   1. dotenv → .env load (MONGO_URI, JWT_SECRET)
 *   2. app = express() → web server create
 *   3. CORS + JSON middleware register
 *   4. /uploads static serve → images public
 *   5. All 6 API route groups register
 *   6. mongoose.connect() → MongoDB Atlas
 *   7. app.listen(5000) → HTTP requests accept
 *
 * .env file format:
 *   MONGO_URI=mongodb+srv://...
 *   JWT_SECRET=your-secret-key
 *
 * API structure:
 *   /api/auth        → Member 1
 *   /api/restaurants → Member 2
 *   /api/food        → Member 3
 *   /api/orders      → Member 4 (+ rider backward compat)
 *   /api/deliveries  → Member 5
 *   /api/reviews     → Member 6
 *
 * Frontend config.js:
 *   API_BASE_URL = 'http://<your-IP>:5000/api'
 *   SERVER_URL   = 'http://<your-IP>:5000'  (images)
 */
