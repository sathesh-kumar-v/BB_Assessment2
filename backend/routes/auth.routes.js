const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

/**
 * POST /api/auth/register
 * - name, email, password, role (optional; admin should create other admins in production)
 */
router.post('/register', authController.register);

/**
 * POST /api/auth/login
 * - email, password
 */
router.post('/login', authController.login);

module.exports = router;
