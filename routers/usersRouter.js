const express = require('express')
const { readToken } = require('../config/token');
const { usersController } = require('../controllers')
const router = express.Router()

router.get('/get', usersController.getData);
router.post('/register', usersController.register);
router.post('/login', usersController.login);
router.get('/keep-login', readToken, usersController.keepLogin);
router.patch('/verified', readToken, usersController.accountVerification);
router.get('/get-address',readToken, usersController.getAddress);
router.post('/add-address', usersController.addAddress);

module.exports = router;