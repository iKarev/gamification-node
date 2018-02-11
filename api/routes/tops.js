const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const TopsController = require('../controllers/tops');

router.get('/', checkAuth, TopsController.tops_get_all);

router.post('/', checkAuth, TopsController.tops_create);

router.get('/:topId', checkAuth, TopsController.tops_get_single);

router.patch('/:topId', checkAuth, TopsController.tops_patch);

router.delete('/:topId', checkAuth, TopsController.tops_delete);

module.exports = router;