require('dotenv').config({ override: true });
const { ensureDatabaseUrl } = require('./databaseUrl');

const databaseUrl = ensureDatabaseUrl();
const isProduction = process.env.NODE_ENV === 'production';
const jwtSecret = process.env.JWT_SECRET || 'local-development-secret-change-me';
const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : ['*'];

if (isProduction && (!process.env.JWT_SECRET || jwtSecret === 'local-development-secret-change-me')) {
  throw new Error('JWT_SECRET must be set to a strong unique value in production');
}

if (isProduction && corsOrigin.includes('*')) {
  throw new Error('CORS_ORIGIN must be an explicit allow-list in production');
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction,
  port: Number(process.env.PORT || 5000),
  databaseUrl,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USERNAME || process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'asset_tracking',
    schema: process.env.DB_SCHEMA || 'public'
  },
  autoDbSetup: process.env.AUTO_DB_SETUP !== 'false',
  autoDbSeed: process.env.AUTO_DB_SEED !== 'false',
  maintenanceDatabase: process.env.DB_MAINTENANCE_DATABASE || 'postgres',
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  corsOrigin,
  uploadDir: process.env.UPLOAD_DIR || 'src/uploads',
  qrPublicBaseUrl: process.env.QR_PUBLIC_BASE_URL || 'http://localhost:5000',
  qrSigningSecret: process.env.QR_SIGNING_SECRET || jwtSecret,
  qrRequireSignature: process.env.QR_REQUIRE_SIGNATURE === 'true' || isProduction,
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 300),
  authRateLimitMax: Number(process.env.AUTH_RATE_LIMIT_MAX || 20),
  admin: {
    id: process.env.ADMIN_ID || process.env.ADMIN_USERNAME || 'env-admin',
    username: process.env.ADMIN_USERNAME || 'superadmin',
    email: process.env.ADMIN_EMAIL || 'admin@company.com',
    password: process.env.ADMIN_PASSWORD || ''
  }
};
