var express = require('express');
var lineRouter = require('./line/bot.route');
var logger = require('./../config/winston')(__filename)

var router = express.Router();

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) => {
      logger.info('health check')
      res.send('Service ok.')
    }
);

router.use('/v1/bot', lineRouter);

module.exports = router;
