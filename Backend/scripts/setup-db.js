require('dotenv').config({ override: true });
const { bootstrapDatabase } = require('../src/config/databaseBootstrap');

bootstrapDatabase()
  .then(() => {
    console.log('Database setup complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database setup failed');
    console.error(error.message);
    process.exit(1);
  });
