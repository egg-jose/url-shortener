const express = require('express');
const router = express.Router();
const shortenController = require('../../components/shorten/shorten.controller');

router.post('/api/v1/shorten', shortenController.createShortUrl);
router.get('/:shortCode', shortenController.redirectUrl);
router.get('/api/v1/urls/:shortCode', shortenController.getShortUrl);
router.delete('/api/v1/urls/:shortCode', shortenController.deleteShortUrl);

module.exports = router;
