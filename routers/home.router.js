var express = require('express');
var homeController = require('../controllers/home.controller.js');

var router = express.Router();

router.post('/editpass', homeController.edit_password);
router.get('/calendar', homeController.calendar);
router.get('/module', homeController.point);
router.get('/register-calendar', homeController.dangKyLich);
router.post('/register-calendar/add', homeController.calendar_add);
module.exports = router;