const express = require('express');
const router = express.Router();
const { listProducts, createProduct, updateProduct, softDeleteProduct } = require('../controllers/productsController');
const { createMovement, listMovements, getStockBalance } = require('../controllers/productMovementsController');

router.get('/', listProducts);
router.post('/', createProduct);
router.patch('/:id', updateProduct);
router.delete('/:id', softDeleteProduct);

router.post('/:id/product-movements', createMovement);
router.get('/:id/product-movements', listMovements);
router.get('/:id/stock-balance', getStockBalance);

module.exports = router;