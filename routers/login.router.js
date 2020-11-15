var express = require('express');
var loginController = require('../controllers/login.controller.js');

var router = express.Router();

router.get('/', loginController.login);
router.post('/', loginController.login_post);
router.get('/logout', loginController.logout);

module.exports = router;