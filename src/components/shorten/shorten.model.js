const mongoose = require('mongoose');

const shortenUrlSchema = new mongoose.Schema(
    {
        originalURL: {
            type: String,
            required: true,
        },
        shortCode: {
            type: String,
            required: true,
            unique: true,
        },
        shortURL: {
            type: String,
            required: true,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('ShortenUrl', shortenUrlSchema);
