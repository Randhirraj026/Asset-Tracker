const prisma = require('../prisma/client');

const create = ({ adminId, action, module, ipAddress }) => prisma.auditLog.create({
  data: { adminId, action, module, ipAddress }
});

module.exports = { create };
