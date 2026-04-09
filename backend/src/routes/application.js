const express = require('express');
const router = express.Router();
const { validate } = require('../middleware/validate');
const { applicationSchema } = require('../schemas/applicationSchema');
const { createApplication } = require('../controllers/applicationController');

router.post('/', validate(applicationSchema), createApplication);

module.exports = router;
