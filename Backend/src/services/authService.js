const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const adminRepository = require('../repositories/adminRepository');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

const sanitizeAdmin = (admin) => ({
  id: admin.id,
  username: admin.username,
  email: admin.email,
  role: admin.role,
  lastLogin: admin.lastLogin,
  createdAt: admin.createdAt
});

const signToken = (admin) => jwt.sign(
  { sub: admin.id, role: admin.role, email: admin.email },
  env.jwtSecret,
  { expiresIn: env.jwtExpiresIn }
);

const login = async ({ email, password }) => {
  if (env.admin.email && env.admin.password) {
    if (email !== env.admin.email || password !== env.admin.password) {
      throw new AppError('Invalid email or password', 401);
    }

    const admin = {
      id: env.admin.id,
      username: env.admin.username,
      email: env.admin.email,
      role: 'SUPER_ADMIN',
      lastLogin: new Date(),
      createdAt: new Date()
    };

    logger.info('admin_login', { adminId: admin.id, email: admin.email, source: 'env' });
    return { token: signToken(admin), admin: sanitizeAdmin(admin) };
  }

  const admin = await adminRepository.findByEmail(email);
  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
    throw new AppError('Invalid email or password', 401);
  }

  await adminRepository.updateLastLogin(admin.id);
  logger.info('admin_login', { adminId: admin.id, email: admin.email });
  return { token: signToken(admin), admin: sanitizeAdmin(admin) };
};

module.exports = { login, sanitizeAdmin };
