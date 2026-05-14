const { z, logStatus } = require('./commonSchemas');

const list = z.object({
  body: z.object({}).passthrough(),
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    status: logStatus.optional(),
    employeeId: z.string().uuid().optional(),
    assetId: z.string().uuid().optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    export: z.enum(['excel', 'pdf']).optional()
  }).partial(),
  params: z.object({}).passthrough()
});

module.exports = { list };
