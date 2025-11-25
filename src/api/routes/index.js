const express = require('express');
const router = express.Router();
const shortenRoutes = require('./shorten.route');

router.use('/', shortenRoutes);

module.exports = router;
