const bcrypt = require('bcryptjs');
require('dotenv').config({ override: true });
require('../src/config/env');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const envAdminUsername = process.env.ADMIN_USERNAME;
  const envAdminEmail = process.env.ADMIN_EMAIL;
  const envAdminPassword = process.env.ADMIN_PASSWORD;

  const seedAdminUsername = envAdminUsername || 'superadmin';
  const seedAdminEmail = envAdminEmail || 'admin@company.com';
  const seedAdminPassword = envAdminPassword || 'admin123';

  let admin = null;
  if (!envAdminEmail || !envAdminPassword) {
    const passwordHash = await bcrypt.hash(seedAdminPassword, 12);

    const existingAdmin = await prisma.admin.findFirst({
      where: {
        OR: [
          { email: seedAdminEmail },
          { username: seedAdminUsername }
        ]
      }
    });

    admin = existingAdmin
      ? await prisma.admin.update({
        where: { id: existingAdmin.id },
        data: {
          email: existingAdmin.email === seedAdminEmail ? seedAdminEmail : existingAdmin.email,
          username: existingAdmin.username === seedAdminUsername ? seedAdminUsername : existingAdmin.username,
          role: 'SUPER_ADMIN'
        }
      })
      : await prisma.admin.create({
        data: {
          username: seedAdminUsername,
          email: seedAdminEmail,
          passwordHash,
          role: 'SUPER_ADMIN'
        }
      });
  } else {
    console.log('Skipping admin seed because admin login is configured from environment variables.');
  }

  const employee = await prisma.employee.upsert({
    where: { empId: 'EMP001' },
    update: {},
    create: {
      empId: 'EMP001',
      name: 'Demo Employee',
      email: 'employee@example.com',
      department: 'IT',
      designation: 'Systems Engineer',
      phone: '+91-9000000000'
    }
  });

  await prisma.asset.upsert({
    where: { assetId: 'AST001' },
    update: {},
    create: {
      assetId: 'AST001',
      assetType: 'Laptop',
      serialNumber: 'SN-DEMO-001',
      model: 'ThinkPad T14',
      assignedEmployeeId: employee.id,
      assignedDate: new Date(),
      status: 'IN_OFFICE',
      remarks: 'Seed asset'
    }
  });

  if (admin) {
    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: 'SEED_DATABASE',
        module: 'SYSTEM',
        ipAddress: '127.0.0.1'
      }
    });

    console.log(`Seed complete. Login with ${seedAdminEmail} / ${seedAdminPassword}`);
  } else {
    console.log('Seed complete. Admin login is configured from environment variables and will not be stored in the database.');
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
