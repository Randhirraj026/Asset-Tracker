const { z } = require('./commonSchemas');

const scanBody = z.object({
  qrData: z.union([z.string(), z.record(z.any())]).optional(),
  assetId: z.string().trim().optional(),
  serialNumber: z.string().trim().optional(),
  employeeId: z.string().trim().optional(),
  movementType: z.enum(['OUT', 'IN', 'MAINTENANCE']).optional(),
  remarks: z.string().trim().max(1000).optional()
}).refine((data) => data.qrData || data.assetId || data.serialNumber, {
  message: 'qrData, assetId, or serialNumber is required'
});

const selectedScanBody = scanBody.refine((data) => data.movementType, {
  message: 'movementType is required',
  path: ['movementType']
});

const scan = z.object({
  body: scanBody,
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough()
});

const selectedScan = z.object({
  body: selectedScanBody,
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough()
});

module.exports = { scan, selectedScan };
