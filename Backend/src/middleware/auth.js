const jwt = require('jsonwebtoken');
const env = require('../config/env');
const prisma = require('../prisma/client');
const AppError = require('../utils/AppError');

module.exports = async (req, _res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new AppError('Authentication token is required', 401);

    const payload = jwt.verify(token, env.jwtSecret);
    if (env.admin.email && env.admin.password && payload.sub === env.admin.id) {
      req.user = {
        id: env.admin.id,
        username: env.admin.username,
        email: env.admin.email,
        role: 'SUPER_ADMIN',
        lastLogin: new Date(),
        createdAt: new Date()
      };
      return next();
    }

    const admin = await prisma.admin.findUnique({ where: { id: payload.sub } });
    if (!admin) throw new AppError('Authenticated user no longer exists', 401);

    req.user = admin;
    next();
  } catch (error) {
    next(error.name === 'JsonWebTokenError' ? new AppError('Invalid token', 401) : error);
  }
};
