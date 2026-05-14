const prisma = require('../prisma/client');

const include = {
  assets: { select: { id: true, assetId: true, assetType: true, serialNumber: true, status: true } }
};

const create = (data) => prisma.employee.create({ data, include });
const findById = (id) => prisma.employee.findUnique({ where: { id }, include });
const findByEmpId = (empId) => prisma.employee.findUnique({ where: { empId }, include });
const update = (id, data) => prisma.employee.update({ where: { id }, data, include });
const remove = (id) => prisma.employee.delete({ where: { id } });
const history = (id) => prisma.assetLog.findMany({
  where: { employeeId: id },
  include: { asset: true, scanner: { select: { id: true, username: true, role: true } } },
  orderBy: { createdAt: 'desc' }
});

const list = ({ skip, take, search, department }) => {
  const where = {
    ...(department ? { department } : {}),
    ...(search ? {
      OR: [
        { empId: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } }
      ]
    } : {})
  };

  return prisma.$transaction([
    prisma.employee.findMany({ where, skip, take, include, orderBy: { createdAt: 'desc' } }),
    prisma.employee.count({ where })
  ]);
};

module.exports = { create, findById, findByEmpId, update, remove, list, history };
