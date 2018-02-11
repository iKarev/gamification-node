const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const UsersController = require('../controllers/users');

router.post('/login', UsersController.users_login);

router.post('/signup', UsersController.users_signup);

router.delete('/:userId', checkAuth, UsersController.users_delete_user);

module.exports = router;