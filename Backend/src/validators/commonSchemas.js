const { z } = require('zod');
const { ASSET_STATUSES, ADMIN_ROLES, LOG_STATUSES } = require('../constants/enums');

const uuidParam = z.object({ params: z.object({ id: z.string().uuid() }) });
const paginationQuery = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().trim().optional()
});

const assetStatus = z.enum(ASSET_STATUSES);
const adminRole = z.enum(ADMIN_ROLES);
const logStatus = z.enum(LOG_STATUSES);

module.exports = { z, uuidParam, paginationQuery, assetStatus, adminRole, logStatus };
