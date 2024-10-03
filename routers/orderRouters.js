const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authorize = require("../middlewares/adminAuthorization");

// Public routes (no authorization required)
router.post('/', orderController.createOrder);
router.get('/:id', orderController.getSingleOrder);

// Admin routes (require authorization)
router.get('/all', authorize('admin'), orderController.getAllOrders);
router.get('/track/:id', authorize('admin'), orderController.trackSingleOrder);
router.post('/edit/:id', authorize('admin'), orderController.editSingleOrder);
router.get('/search', authorize('admin'), orderController.searchOrder);
router.get('/filter', authorize('admin'), orderController.filterOrders);
router.get('/location/:id', authorize('admin'), orderController.getOrderLocation);

module.exports = router;