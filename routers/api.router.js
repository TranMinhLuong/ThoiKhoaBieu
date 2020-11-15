var express = require('express');
var apiController = require('../controllers/api.controller.js');

var router = express.Router();

router.post('/login', apiController.login)
router.get('/', apiController.test)
router.get('/calendar/:msv', apiController.calendar)
router.get('/calendartoday/:msv/', apiController.calendarToday)
router.get('/point/:msv', apiController.showPoint)
router.post('/updateSV', apiController.updateSV)
router.post('/editpass', apiController.edit_password);

module.exports = router;