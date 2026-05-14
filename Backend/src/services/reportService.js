const prisma = require('../prisma/client');

const monthRange = (query) => {
  const year = Number(query.year || new Date().getFullYear());
  const month = Number(query.month || new Date().getMonth() + 1);
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  return { start, end };
};

const monthly = async (query) => {
  const { start, end } = monthRange(query);
  const [movements, outside, returned] = await Promise.all([
    prisma.assetLog.count({ where: { createdAt: { gte: start, lt: end } } }),
    prisma.assetLog.count({ where: { status: 'OUT', createdAt: { gte: start, lt: end } } }),
    prisma.assetLog.count({ where: { status: 'IN', createdAt: { gte: start, lt: end } } })
  ]);
  return { start, end, movements, outside, returned };
};

const employeeWise = () => prisma.employee.findMany({
  select: {
    id: true,
    empId: true,
    name: true,
    department: true,
    _count: { select: { logs: true, assets: true } }
  },
  orderBy: { name: 'asc' }
});

const assetWise = () => prisma.asset.findMany({
  select: {
    id: true,
    assetId: true,
    assetType: true,
    serialNumber: true,
    status: true,
    assignedEmployee: { select: { empId: true, name: true } },
    _count: { select: { logs: true } }
  },
  orderBy: { createdAt: 'desc' }
});

const overdue = (query) => {
  const hours = Number(query.hours || 24);
  const threshold = new Date(Date.now() - hours * 36e5);
  return prisma.assetLog.findMany({
    where: { status: 'OUT', entryTime: null, exitTime: { lt: threshold } },
    include: { asset: true, employee: true },
    orderBy: { exitTime: 'asc' }
  });
};

const frequentAssets = () => prisma.asset.findMany({
  select: {
    id: true,
    assetId: true,
    assetType: true,
    serialNumber: true,
    _count: { select: { logs: true } }
  },
  orderBy: { logs: { _count: 'desc' } },
  take: 20
});

module.exports = { monthly, employeeWise, assetWise, overdue, frequentAssets };
