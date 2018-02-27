const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const checkFriend = require('../middleware/check-friend');

const TargetsController = require('../controllers/targets');

router.get('/', checkAuth, TargetsController.targets_get_all_targets);

router.get('/statistics', checkAuth, TargetsController.targets_get_statistics);

router.post('/', checkAuth, TargetsController.targets_create_target);

router.get('/:targetId', checkAuth, checkFriend, TargetsController.targets_get_single_target);

router.get('/:parentTargetId/list', checkAuth, TargetsController.targets_get_target_children);

router.patch('/:targetId', checkAuth, TargetsController.targets_patch_target);

router.delete('/:targetId', checkAuth, TargetsController.targets_delete_target);

module.exports = router;