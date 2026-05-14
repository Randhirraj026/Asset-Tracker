const { z, uuidParam, paginationQuery } = require('./commonSchemas');

const employeeBaseBody = z.object({
  empId: z.string().trim().min(2).max(50).optional(),
  employeeId: z.string().trim().min(2).max(50).optional(),
  name: z.string().trim().min(2).max(150),
  email: z.string().trim().toLowerCase().email().max(150),
  department: z.string().trim().min(2).max(100),
  designation: z.string().trim().min(2).max(100),
  phone: z.string().trim().max(30).optional().nullable()
});

const employeeCreateBody = employeeBaseBody.refine((data) => data.empId || data.employeeId, {
  message: 'empId or employeeId is required',
  path: ['empId']
});

const create = z.object({
  body: employeeCreateBody,
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough()
});

const update = z.object({
  body: employeeBaseBody.partial(),
  query: z.object({}).passthrough(),
  params: uuidParam.shape.params
});

const list = z.object({
  body: z.object({}).passthrough(),
  query: paginationQuery.extend({ department: z.string().optional() }).partial(),
  params: z.object({}).passthrough()
});

module.exports = { create, update, list, id: uuidParam };
