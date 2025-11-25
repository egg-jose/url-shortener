const shortenService = require('./shorten.service');
const validUrl = require('valid-url');
const { nanoid } = require('nanoid');
const { AppError } = require('../../middleware/errorHandler');
const config = require('../../config');

const SHORTCODELENGTH = 6;

const createShortUrl = async (req, res, next) => {
    try {
        const { url } = req.body;
        if (!url) {
            throw new AppError(
                400,
                'The url field is required. Please provide a valid URL to shorten.'
            );
        }
        if (!validUrl.isUri(url)) {
            throw new AppError(
                400,
                'The provided URL is not a valid URI format. Please ensure it starts with http:// or https://'
            );
        }

        if (url.length > 2048) {
            throw new AppError(
                400,
                'The provided URL exceeds the maximum allowed length of 2048 characters. Please provide a shorter URL.'
            );
        }
        let shortCode = nanoid(SHORTCODELENGTH);
        let shortURL = `${config.baseUrl}/${shortCode}`;
        let shorterUrl;
        const MAX_RETRIES = 5;
        for (let i = 0; i < MAX_RETRIES; i++) {
            try {
                shorterUrl = await shortenService.createShortUrl(
                    url,
                    shortCode,
                    shortURL
                );
                break;
            } catch (error) {
                if (error.code === 11000) {
                    console.warn(
                        `Duplicate shortCode '${shortCode}' detected. Retrying...`
                    );
                    shortCode = nanoid(SHORTCODELENGTH);
                    shortURL = `${config.baseUrl}/${shortCode}`;
                } else {
                    throw error;
                }
            }
        }

        if (!shorterUrl) {
            throw new AppError(
                500,
                'Failed to generate a unique short URL after multiple retries. Please try again later.'
            );
        }
        res.status(201).json({
            originalURL: shorterUrl.originalURL,
            shortCode: shorterUrl.shortCode,
            shortURL: shorterUrl.shortURL,
            createdAt: shorterUrl.createdAt,
        });
    } catch (error) {
        next(error);
    }
};

const redirectUrl = async (req, res, next) => {
    try {
        const shortCode = req.params.shortCode;
        if (shortCode.length !== SHORTCODELENGTH) {
            throw new AppError(
                400,
                `invalid short code length. The short code must be exactly ${SHORTCODELENGTH} characters long.`
            );
        }
        const shorterUrl = await shortenService.findOne({
            shortCode: shortCode,
            deletedAt: null,
        });
        if (shorterUrl == null) {
            throw new AppError(
                404,
                'The short URL you requested does not exist, has been deleted, or is invalid. Please check the short code and try again.'
            );
        }

        res.redirect(shorterUrl.originalURL);
    } catch (error) {
        next(error);
    }
};

const getShortUrl = async (req, res, next) => {
    try {
        const shortCode = req.params.shortCode;
        if (shortCode.length !== SHORTCODELENGTH) {
            throw new AppError(
                400,
                `invalid short code length. The short code must be exactly ${SHORTCODELENGTH} characters long.`
            );
        }

        const shorterUrl = await shortenService.findOne({
            shortCode: shortCode,
            deletedAt: null,
        });
        if (shorterUrl == null) {
            throw new AppError(
                404,
                'The short URL you requested does not exist, has been deleted, or is invalid. Please check the short code and try again.'
            );
        }
        res.json({
            originalURL: shorterUrl.originalURL,
            shortCode: shorterUrl.shortCode,
            shortURL: shorterUrl.shortURL,
            createdAt: shorterUrl.createdAt,
        });
    } catch (error) {
        next(error);
    }
};

const deleteShortUrl = async (req, res, next) => {
    try {
        const shortCode = req.params.shortCode;
        if (shortCode.length !== SHORTCODELENGTH) {
            throw new AppError(
                400,
                `invalid short code length. The short code must be exactly ${SHORTCODELENGTH} characters long.`
            );
        }

        const shorterUrl = await shortenService.findOneAndUpdate(
            { shortCode: shortCode, deletedAt: null },
            { deletedAt: new Date() }
        );
        if (!shorterUrl) {
            throw new AppError(
                404,
                'The short URL you are trying to delete does not exist or has already been deleted. Please verify the short code.'
            );
        }
        res.status(200).json({ message: 'Short URL deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createShortUrl,
    redirectUrl,
    getShortUrl,
    deleteShortUrl,
};
