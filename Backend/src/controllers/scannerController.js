const scannerService = require('../services/scannerService');
const auditService = require('../services/auditService');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');

const handleMovement = (serviceCall, successAction, failureAction, successMessage, statusCode = 200) => asyncHandler(async (req, res) => {
  try {
    const result = await serviceCall(req.validated.body, req.user.id);
    await auditService.record(req, successAction, 'SCANNER');
    return success(res, successMessage, result, statusCode);
  } catch (error) {
    await auditService.record(req, failureAction, 'SCANNER');
    throw error;
  }
});

const maintenance = handleMovement(
  scannerService.maintenanceAsset,
  'SCAN_MAINTENANCE',
  'SCAN_MAINTENANCE_REJECTED',
  'Asset movement recorded successfully'
);

module.exports = {
  exit: handleMovement(scannerService.exitAsset, 'SCAN_EXIT', 'SCAN_EXIT_REJECTED', 'Asset movement recorded successfully', 201),
  entry: handleMovement(scannerService.enterAsset, 'SCAN_ENTRY', 'SCAN_ENTRY_REJECTED', 'Asset movement recorded successfully'),
  maintenance,
  scan: handleMovement(scannerService.scan, 'SCAN_SELECTED', 'SCAN_SELECTED_REJECTED', 'Asset movement recorded successfully')
};
