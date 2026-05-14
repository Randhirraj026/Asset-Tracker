const { z, uuidParam, paginationQuery, assetStatus } = require('./commonSchemas');

const assetBaseBody = z.object({
  assetId: z.string().trim().min(2).max(50),
  assetType: z.string().trim().min(2).max(100).optional(),
  type: z.string().trim().min(2).max(100).optional(),
  serialNumber: z.string().trim().min(2).max(100),
  model: z.string().trim().max(100).optional().nullable(),
  qrCode: z.string().max(255).optional().nullable(),
  assignedEmployeeId: z.string().optional().nullable(),
  assignedEmployee: z.string().optional().nullable(),
  employeeId: z.string().optional().nullable(),
  assignedDate: z.coerce.date().optional().nullable(),
  status: z.never({
    invalid_type_error: 'Asset status can only be changed by scanner movement APIs'
  }).optional(),
  remarks: z.string().trim().max(1000).optional().nullable()
});

const assetCreateBody = assetBaseBody.refine((data) => data.assetType || data.type, {
  message: 'assetType or type is required',
  path: ['assetType']
});

const create = z.object({
  body: assetCreateBody,
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough()
});

const update = z.object({
  body: assetBaseBody.partial(),
  query: z.object({}).passthrough(),
  params: uuidParam.shape.params
});

const list = z.object({
  body: z.object({}).passthrough(),
  query: paginationQuery.extend({
    status: assetStatus.optional(),
    employeeId: z.string().uuid().optional()
  }).partial(),
  params: z.object({}).passthrough()
});

const assign = z.object({
  body: z.object({
    employeeId: z.string().trim().min(2),
    remarks: z.string().trim().max(1000).optional()
  }),
  query: z.object({}).passthrough(),
  params: uuidParam.shape.params
});

module.exports = { create, update, list, assign, id: uuidParam };
