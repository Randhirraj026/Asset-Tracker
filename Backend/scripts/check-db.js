require('dotenv').config({ override: true });
require('../src/config/env');
const prisma = require('../src/prisma/client');

async function main() {
  await prisma.$queryRaw`SELECT 1`;
  console.log('Database connection OK');
}

main()
  .catch((error) => {
    console.error('Database connection failed');
    console.error(error.message);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
