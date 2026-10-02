const express = require('express');
const router = express.Router();
const { listRawMaterials, createRawMaterial, updateRawMaterial, softDeleteRawMaterial } = require('../controllers/rawMaterialsController');
const { createMovement, listMovements, getStockBalance } = require('../controllers/rawMaterialMovementsController');

router.get('/', listRawMaterials);
router.post('/', createRawMaterial);
router.patch('/:id', updateRawMaterial);
router.delete('/:id', softDeleteRawMaterial);

router.post('/:id/stock-movements', createMovement);
router.get('/:id/stock-movements', listMovements);
router.get('/:id/stock-balance', getStockBalance);

module.exports = router;