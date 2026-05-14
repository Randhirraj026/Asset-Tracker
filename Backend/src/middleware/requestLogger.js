const logger = require('../utils/logger');

module.exports = (req, res, next) => {
  const startedAt = Date.now();
  res.on('finish', () => {
    logger.info('api_request', {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
      ip: req.ip
    });
  });
  next();
};
