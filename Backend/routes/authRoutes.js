const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');


const router = express.Router();

// Registering new user
router.post('/signup', authController.signup);
// Logging in existing user
router.post('/login', authController.login);
// Updating  logged-in user's information
router.patch('/update', authMiddleware, authController.updateInfo);
// Logging out of existing user
router.post('/logout', authController.logout);
  
module.exports = router;


