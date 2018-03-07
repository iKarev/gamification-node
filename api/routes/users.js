const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const UsersController = require('../controllers/users');

router.get('/', checkAuth, UsersController.users_get_list);

router.post('/login', UsersController.users_login);

router.post('/signup', UsersController.users_signup);

router.delete('/:userId', checkAuth, UsersController.users_delete_user);

router.get('/friendship', checkAuth, UsersController.users_get_friends);

router.patch('/friendship/:type', checkAuth, UsersController.users_friendship_request);

router.get('/notifications', checkAuth, UsersController.user_get_notifications);

module.exports = router;