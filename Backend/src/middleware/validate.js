module.exports = (schema) => (req, _res, next) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params
  });

  if (!result.success) {
    const errors = result.error.errors.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message
    }));
    const AppError = require('../utils/AppError');
    return next(new AppError('Validation failed', 422, errors));
  }

  req.validated = result.data;
  return next();
};
