const buildDatabaseUrl = () => {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '5432';
  const user = process.env.DB_USERNAME || process.env.DB_USER || 'postgres';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'asset_tracking';
  const schema = process.env.DB_SCHEMA || 'public';

  const encodedUser = encodeURIComponent(user);
  const encodedPassword = encodeURIComponent(password);

  return `postgresql://${encodedUser}:${encodedPassword}@${host}:${port}/${database}?schema=${schema}`;
};

const ensureDatabaseUrl = () => {
  const databaseUrl = buildDatabaseUrl();
  process.env.DATABASE_URL = databaseUrl;
  return databaseUrl;
};

module.exports = { buildDatabaseUrl, ensureDatabaseUrl };
