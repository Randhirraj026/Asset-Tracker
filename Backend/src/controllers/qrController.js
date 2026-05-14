const qrService = require('../services/qrService');
const auditService = require('../services/auditService');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');

const generate = asyncHandler(async (req, res) => {
  const result = await qrService.generateQr(req.validated.body.assetId);
  await auditService.record(req, 'GENERATE_QR', 'QR');
  return success(res, 'QR generated successfully', result, 201);
});

const verify = asyncHandler(async (req, res) => {
  const result = await qrService.verifyQr(req.validated.body.qrData);
  return success(res, 'QR verified successfully', result);
});

module.exports = { generate, verify };
