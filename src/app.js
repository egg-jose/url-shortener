const express = require('express');
const mongoose = require('mongoose');

const app = express();

const config = require('./config');
mongoose.connect(config.db);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const routes = require('./api/routes');
const errorHandler = require('./middleware/errorHandler');

app.use(routes);
app.use(errorHandler);

module.exports = app;
