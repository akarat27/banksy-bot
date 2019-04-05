const express   = require('express');
const webCtrl = require('./bot.web.controller');
const lineCtrl  = require('./bot.line.controller');
var config      = require('./../../config/line.config');

const jsonfile = require('jsonfile')
var path = require('path');

const router = express.Router();

/** absolute url is /api/bot/<route path> */

router.route('/webhook')
    .post(
        lineCtrl.middleware(config),
        lineCtrl.handlePreErr,
        lineCtrl.webhook
        );

router.route('/tfex')
    /** POST /:brandId/:orderId - Create new order push message */
    .get(webCtrl.tfex);


module.exports = router;