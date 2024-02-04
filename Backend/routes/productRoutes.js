const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');

// Creating a product
router.post('/create', authMiddleware, productController.createProduct);
// Fetch all products created by the authenticated user
router.get('/all', authMiddleware, productController.getUserProducts);
// Delete a product
router.delete('/delete/:productId', authMiddleware, productController.deleteProduct);
// Update a product
router.patch('/update/:productId', authMiddleware, productController.updateProduct);

module.exports = router;
