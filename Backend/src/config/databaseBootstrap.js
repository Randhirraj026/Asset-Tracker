const { execFile } = require('child_process');
const path = require('path');
const { Client } = require('pg');
const env = require('./env');
const logger = require('../utils/logger');

const projectRoot = path.resolve(__dirname, '..', '..');

const quoteIdentifier = (value) => `"${String(value).replace(/"/g, '""')}"`;

const runCommand = (command, args) => new Promise((resolve, reject) => {
  execFile(command, args, { cwd: projectRoot, env: process.env }, (error, stdout, stderr) => {
    if (stdout) logger.info(stdout.trim());
    if (stderr) logger.warn(stderr.trim());
    if (error) return reject(error);
    return resolve();
  });
});

const nodeCommand = () => process.execPath;
const prismaCliPath = () => path.join(projectRoot, 'node_modules', 'prisma', 'build', 'index.js');

const parseDatabaseUrl = () => {
  if (!env.databaseUrl) throw new Error('DATABASE_URL is required');
  const targetUrl = new URL(env.databaseUrl);
  const databaseName = decodeURIComponent(targetUrl.pathname.replace(/^\//, ''));
  if (!databaseName) throw new Error('DATABASE_URL must include a database name');

  const maintenanceUrl = new URL(env.databaseUrl);
  maintenanceUrl.pathname = `/${env.maintenanceDatabase}`;
  maintenanceUrl.search = '';

  return { targetUrl, maintenanceUrl, databaseName };
};

const ensureDatabaseExists = async () => {
  const { maintenanceUrl, databaseName } = parseDatabaseUrl();
  const client = new Client({ connectionString: maintenanceUrl.toString() });

  await client.connect();
  try {
    const result = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [databaseName]);
    if (result.rowCount > 0) {
      logger.info(`Database "${databaseName}" already exists`);
      return;
    }

    await client.query(`CREATE DATABASE ${quoteIdentifier(databaseName)}`);
    logger.info(`Database "${databaseName}" created`);
  } finally {
    await client.end();
  }
};

const applyMigrations = async () => {
  logger.info('Applying Prisma migrations');
  await runCommand(nodeCommand(), [prismaCliPath(), 'migrate', 'deploy']);
};

const seedDatabase = async () => {
  if (!env.autoDbSeed) return;
  logger.info('Running database seed');
  await runCommand(nodeCommand(), ['prisma/seed.js']);
};

const bootstrapDatabase = async () => {
  if (!env.autoDbSetup) {
    logger.info('Automatic database setup disabled');
    return;
  }

  await ensureDatabaseExists();
  await applyMigrations();
  await seedDatabase();
};

module.exports = { bootstrapDatabase, ensureDatabaseExists, applyMigrations, seedDatabase };
