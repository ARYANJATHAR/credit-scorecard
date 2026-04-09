const express = require('express');
const router = express.Router();
const { decisionRateLimiter } = require('../middleware/rateLimiter');
const { validateUuidParam } = require('../middleware/validateUuidParam');
const { generateDecision, getDecision } = require('../controllers/decisionController');

router.post('/:applicationId', validateUuidParam('applicationId'), decisionRateLimiter, generateDecision);
router.get('/:applicationId', validateUuidParam('applicationId'), getDecision);

module.exports = router;
