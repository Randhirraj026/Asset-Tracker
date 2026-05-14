const prisma = require('../prisma/client');

const include = {
  assignedEmployee: { select: { id: true, empId: true, name: true, email: true, department: true } }
};

const create = (data) => prisma.asset.create({ data, include });
const findById = (id) => prisma.asset.findUnique({ where: { id }, include });
const findByAssetId = (assetId) => prisma.asset.findUnique({ where: { assetId }, include });
const findBySerialNumber = (serialNumber) => prisma.asset.findUnique({ where: { serialNumber }, include });
const update = (id, data) => prisma.asset.update({ where: { id }, data, include });
const remove = (id) => prisma.asset.delete({ where: { id } });
const history = (id) => prisma.assetLog.findMany({
  where: { assetId: id },
  include: { employee: true, scanner: { select: { id: true, username: true, role: true } } },
  orderBy: { createdAt: 'desc' }
});

const list = ({ skip, take, search, status, employeeId }) => {
  const where = {
    ...(status ? { status } : {}),
    ...(employeeId ? { assignedEmployeeId: employeeId } : {}),
    ...(search ? {
      OR: [
        { assetId: { contains: search, mode: 'insensitive' } },
        { assetType: { contains: search, mode: 'insensitive' } },
        { serialNumber: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } }
      ]
    } : {})
  };

  return prisma.$transaction([
    prisma.asset.findMany({ where, skip, take, include, orderBy: { createdAt: 'desc' } }),
    prisma.asset.count({ where })
  ]);
};

module.exports = { create, findById, findByAssetId, findBySerialNumber, update, remove, list, history };
