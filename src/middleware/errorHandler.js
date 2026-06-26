const logger = require('../logger');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  logger.error({ err, path: req.path, method: req.method }, 'unhandled error');
  res.status(500).json({ error: 'internal_server_error' });
}

module.exports = errorHandler;
