const logService = require('../services/logService');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');

const list = asyncHandler(async (req, res) => {
  const { items, meta } = await logService.listLogs(req.validated.query);

  if (req.validated.query.export === 'excel') {
    const buffer = await logService.exportLogsExcel(items);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="asset-logs.xlsx"');
    return res.send(buffer);
  }

  if (req.validated.query.export === 'pdf') {
    const buffer = await logService.exportLogsPdf(items);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="asset-logs.pdf"');
    return res.send(buffer);
  }

  return success(res, 'Logs fetched successfully', items, 200, meta);
});

const byEmployee = asyncHandler(async (req, res) => {
  const logs = await logService.logsByEmployee(req.params.id);
  return success(res, 'Employee logs fetched successfully', logs);
});

const byAsset = asyncHandler(async (req, res) => {
  const logs = await logService.logsByAsset(req.params.id);
  return success(res, 'Asset logs fetched successfully', logs);
});

module.exports = { list, byEmployee, byAsset };
