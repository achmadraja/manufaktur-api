const express = require('express');
const router = express.Router();
const { listRawMaterials, createRawMaterial, updateRawMaterial, softDeleteRawMaterial } = require('../controllers/rawMaterialsController');

router.get('/', listRawMaterials);
router.post('/', createRawMaterial);
router.patch('/:id', updateRawMaterial);
router.delete('/:id', softDeleteRawMaterial);

module.exports = router;