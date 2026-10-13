const router = require('express').Router();
const { createBatch, listBatches, getBatch } = require('../controllers/batchesController');

router.post('/', createBatch);
router.get('/', listBatches);
router.get('/:id', getBatch);

module.exports = router;