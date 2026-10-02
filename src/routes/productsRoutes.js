const express = require('express');
const router = express.Router();
const { listProducts, createProduct, updateProduct, softDeleteProduct } = require('../controllers/productsController');

router.get('/', listProducts);
router.post('/', createProduct);
router.patch('/:id', updateProduct);
router.delete('/:id', softDeleteProduct);

module.exports = router;