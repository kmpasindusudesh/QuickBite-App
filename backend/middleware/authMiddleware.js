// =====================================================
// authMiddleware.js — Member 1: JWT Authentication Guard
// Express middleware — protected routes walata JWT validate karanawa
//
// "Security Guard" eka wage — valid ID card (JWT token) naththam athulata yanna naha
//
// Use karana thena:
//   Router eke: router.get('/profile', protect, controller.fn)
//   protect → valid naththam controller.fn call; invalid naththam 401
//
// Flow:
//   1. Request Header eken Authorization token gannawa
//   2. JWT verify karanawa (JWT_SECRET use; .env eke thiyenawa)
//   3. Valid naththam → req.user = decoded payload set; next() call
//   4. Invalid hari expired naththam → 401 Unauthorized return
// =====================================================

// jsonwebtoken — JWT decode + verify karanawa
const jwt = require('jsonwebtoken');

// =====================================================
// protect — Middleware function
// req, res, next — Express middleware signature
//   req  = incoming request (headers, body, etc.)
//   res  = response object (error response denawa)
//   next = next middleware hari controller ekata yawanawa (valid naththam)
// =====================================================
const protect = (req, res, next) => {
    // 1. Authorization header eken token gannawa
    // Format: "Bearer eyJhbGci..." — frontend headers eke set karanawa
    const token = req.header('Authorization');

    // 2. Token naha naththam block — 401 Unauthorized
    if (!token) {
        return res.status(401).json({ message: "Access naha! ID card (Token) eka pennanna." });
    }

    try {
        // 3. Token eka verify karanawa
        // "Bearer " prefix remove kara actual JWT eka gannawa
        // JWT_SECRET — .env eke thiyenawa; server restart naththam expire naha
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);

        // 4. Decoded payload (JWT eke sign karapu data) req.user ekata set karanawa
        // Payload format: { id: user._id, role: user.role }  (authController.js eke sign karapu)
        // Controllers eken: req.user.id → user ID; req.user.role → 'customer' | 'manager' | 'rider'
        req.user = decoded;

        // 5. Valid! Next middleware hari controller ekata yawanawa
        next();

    } catch (error) {
        // Token expire / tampered / wrong secret → JWT verify throw karanawa
        res.status(401).json({ message: "Token eka waradiy hari expire wela!" });
    }
};

// Export — routes file eke import karanawa
module.exports = protect;

/*
 * =====================================================
 * Middleware mul sangrahaya — Viva reference
 * =====================================================
 * Member 1 — JWT Middleware:
 *   Input  : req.header('Authorization') = 'Bearer <jwt>'
 *   Process: jwt.verify(token, JWT_SECRET)
 *   Output : req.user = { id, role, iat, exp }
 *   Error  : 401 JSON response
 *
 * Security:
 *   - JWT_SECRET .env eke — never hardcode
 *   - Bearer prefix strip → pure token verify
 *   - Expired token → 401 (server expiry check)
 *   - Tampered payload → signature mismatch → 401
 *
 * Usage pattern:
 *   router.get('/path', protect, controller.fn)
 *   protect runs → req.user set → controller.fn access req.user.id, req.user.role
 *
 * Role check:
 *   protect eka role check KARANNE NAHA (simayi JWT validate)
 *   onlyManager / rider role check controllers eke hari inline functions eke
 */
