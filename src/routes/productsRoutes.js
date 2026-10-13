const express = require('express');
const router = express.Router();
const { listProducts, createProduct, updateProduct, softDeleteProduct } = require('../controllers/productsController');
const { createMovement, listMovements, getStockBalance } = require('../controllers/productMovementsController');
const { authenticate, requirePermission } = require('../middlewares/auth');

router.get('/', authenticate, requirePermission('product:read'), listProducts);
router.post('/', authenticate, requirePermission('product:create'), createProduct);
router.patch('/:id', updateProduct);
router.delete('/:id', softDeleteProduct);

router.post('/:id/product-movements', createMovement);
router.get('/:id/product-movements', listMovements);
router.get('/:id/stock-balance', getStockBalance);

module.exports = router;