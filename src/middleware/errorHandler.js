class AppError extends Error {
    constructor(statusCode, message) {
        super();
        this.statusCode = statusCode;
        this.message = message;
    }
}

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    const { statusCode, message } = err;
    res.status(statusCode || 500).json({
        status: 'error',
        statusCode: statusCode || 500,
        message: message || 'Internal Server Error',
    });
};

module.exports = {
    errorHandler,
    AppError,
};
