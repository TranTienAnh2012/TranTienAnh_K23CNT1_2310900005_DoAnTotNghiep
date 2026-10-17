const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// Public endpoints
router.post('/login', authController.login);

// Protected endpoints
router.get('/me', authMiddleware, authController.getProfile);
router.post('/change-password', authMiddleware, authController.changePassword);

module.exports = router;
