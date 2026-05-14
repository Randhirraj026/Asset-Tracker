const auditRepository = require('../repositories/auditRepository');
const logger = require('../utils/logger');
const { nullableUuid } = require('../utils/uuid');

const record = async (req, action, module) => {
  if (!req.user?.id) return;
  try {
    await auditRepository.create({ adminId: nullableUuid(req.user.id), action, module, ipAddress: req.ip });
  } catch (error) {
    logger.error('audit_log_failed', { error: error.message, action, module });
  }
};

module.exports = { record };
