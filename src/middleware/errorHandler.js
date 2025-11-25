const { handleError } = require('../utils/errorHandler');

const errorHandler = (err, req, res) => {
    handleError(err, res);
};

module.exports = errorHandler;
