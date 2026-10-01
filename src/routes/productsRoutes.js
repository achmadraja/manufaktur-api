const express = require('express');
const router = express.Router();
const { listProducts } = require('../controllers/productsController');
router.get('/', listProducts);
 
module.exports = router;