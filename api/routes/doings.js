const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const DoingsController = require('../controllers/doings');

router.get('/', checkAuth, DoingsController.doings_get_list_of_type);

router.get('/:date/type/:periodType', checkAuth, DoingsController.doings_get_doings_of_date);

router.post('/', checkAuth, DoingsController.doings_create_doing);

router.patch('/:doingId', checkAuth, DoingsController.doings_patch_doing);

router.put('/:doingId/implements', checkAuth, DoingsController.doings_add_implements);

router.patch('/:doingId/implements', checkAuth, DoingsController.doings_patch_implements);

router.delete('/:doingId', checkAuth, DoingsController.doings_delete_doing);

module.exports = router;