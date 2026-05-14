const prisma = require('../prisma/client');

const findByEmail = (email) => prisma.admin.findUnique({ where: { email } });
const findById = (id) => prisma.admin.findUnique({ where: { id } });
const updateLastLogin = (id) => prisma.admin.update({ where: { id }, data: { lastLogin: new Date() } });

module.exports = { findByEmail, findById, updateLastLogin };
