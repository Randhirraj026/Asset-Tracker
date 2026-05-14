const { Prisma } = require('@prisma/client');
const AppError = require('../utils/AppError');
const { error } = require('../utils/apiResponse');
const logger = require('../utils/logger');

module.exports = (err, _req, res, _next) => {
  let normalized = err;

  if (err instanceof Prisma.PrismaClientInitializationError) {
    normalized = new AppError('Database connection failed. Check DATABASE_URL in Backend/.env.', 503);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') normalized = new AppError('Unique constraint failed', 409, err.meta?.target || []);
    if (err.code === 'P2025') normalized = new AppError('Record not found', 404);
  }

  const statusCode = normalized.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : normalized.message;
  const errors = normalized.errors || [];

  logger.error(normalized.message, { stack: normalized.stack, errors });
  return error(res, message, errors, statusCode);
};
