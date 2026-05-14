const assetService = require('../services/assetService');
const auditService = require('../services/auditService');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');

const normalize = (body) => {
  const { type, assignedEmployee, employeeId, ...rest } = body;
  const normalized = {
    ...rest,
    assetType: body.assetType || type
  };
  const assignment = body.assignedEmployeeId || employeeId || assignedEmployee;
  if (assignment) normalized.assignedEmployeeId = assignment;
  return normalized;
};

const create = asyncHandler(async (req, res) => {
  const asset = await assetService.createAsset(normalize(req.validated.body));
  await auditService.record(req, 'CREATE_ASSET', 'ASSETS');
  return success(res, 'Asset created successfully', asset, 201);
});

const list = asyncHandler(async (req, res) => {
  const { items, meta } = await assetService.listAssets(req.validated.query);
  return success(res, 'Assets fetched successfully', items, 200, meta);
});

const get = asyncHandler(async (req, res) => {
  const asset = await assetService.getAsset(req.params.id);
  return success(res, 'Asset fetched successfully', asset);
});

const update = asyncHandler(async (req, res) => {
  const asset = await assetService.updateAsset(req.params.id, normalize(req.validated.body));
  await auditService.record(req, 'UPDATE_ASSET', 'ASSETS');
  return success(res, 'Asset updated successfully', asset);
});

const remove = asyncHandler(async (req, res) => {
  await assetService.deleteAsset(req.params.id);
  await auditService.record(req, 'DELETE_ASSET', 'ASSETS');
  return success(res, 'Asset deleted successfully');
});

const assign = asyncHandler(async (req, res) => {
  const asset = await assetService.assignAsset(req.params.id, req.validated.body.employeeId, req.validated.body.remarks);
  await auditService.record(req, 'ASSIGN_ASSET', 'ASSETS');
  return success(res, 'Asset assigned successfully', asset);
});

const history = asyncHandler(async (req, res) => {
  const logs = await assetService.assetHistory(req.params.id);
  return success(res, 'Asset history fetched successfully', logs);
});

module.exports = { create, list, get, update, remove, assign, history };
