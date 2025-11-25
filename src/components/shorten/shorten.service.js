const ShortenUrl = require('./shorten.model');

const createShortUrl = async (originalURL, shortCode, shortURL) => {
    return await ShortenUrl.create({
        originalURL: originalURL,
        shortCode: shortCode,
        shortURL: shortURL,
    });
};

const findOne = async (query) => {
    return await ShortenUrl.findOne(query);
};

const findOneAndUpdate = async (query, update) => {
    return await ShortenUrl.findOneAndUpdate(query, update, { new: true });
};

module.exports = {
    createShortUrl,
    findOne,
    findOneAndUpdate,
};
