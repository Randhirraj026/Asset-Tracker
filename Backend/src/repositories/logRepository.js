const prisma = require('../prisma/client');

const include = {
  asset: true,
  employee: true,
  scanner: { select: { id: true, username: true, role: true } }
};

const list = ({ skip, take, status, employeeId, assetId, from, to }) => {
  const where = {
    ...(status ? { status } : {}),
    ...(employeeId ? { employeeId } : {}),
    ...(assetId ? { assetId } : {}),
    ...(from || to ? { createdAt: { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) } } : {})
  };

  return prisma.$transaction([
    prisma.assetLog.findMany({ where, skip, take, include, orderBy: { createdAt: 'desc' } }),
    prisma.assetLog.count({ where })
  ]);
};

const byEmployee = (employeeId) => prisma.assetLog.findMany({ where: { employeeId }, include, orderBy: { createdAt: 'desc' } });
const byAsset = (assetId) => prisma.assetLog.findMany({ where: { assetId }, include, orderBy: { createdAt: 'desc' } });

module.exports = { list, byEmployee, byAsset };
