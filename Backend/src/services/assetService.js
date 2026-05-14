const assetRepository = require('../repositories/assetRepository');
const employeeRepository = require('../repositories/employeeRepository');
const AppError = require('../utils/AppError');
const { getPagination, paginationMeta } = require('../utils/pagination');

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const resolveEmployeeId = async (identifier) => {
  if (!identifier) return null;
  const employee = uuidRegex.test(identifier)
    ? await employeeRepository.findById(identifier)
    : await employeeRepository.findByEmpId(identifier);
  if (!employee) throw new AppError('Employee not found', 404);
  return employee.id;
};

const normalizeAssignment = async (payload) => {
  const assignedEmployeeId = await resolveEmployeeId(payload.assignedEmployeeId);
  return {
    ...payload,
    assignedEmployeeId,
    assignedDate: assignedEmployeeId ? new Date() : null
  };
};

const rejectDirectMovementState = (payload) => {
  if (Object.prototype.hasOwnProperty.call(payload, 'status')) {
    throw new AppError('Asset status can only be changed by scanner movement APIs', 403);
  }
};

const createAsset = async (payload) => {
  rejectDirectMovementState(payload);
  return assetRepository.create(await normalizeAssignment(payload));
};

const listAssets = async (query) => {
  const { page, limit, skip, take } = getPagination(query);
  const [items, total] = await assetRepository.list({
    skip,
    take,
    search: query.search,
    status: query.status,
    employeeId: query.employeeId
  });
  return { items, meta: paginationMeta(page, limit, total) };
};

const getAsset = async (id) => {
  const asset = await assetRepository.findById(id);
  if (!asset) throw new AppError('Asset not found', 404);
  return asset;
};

const updateAsset = async (id, payload) => {
  await getAsset(id);
  rejectDirectMovementState(payload);
  if (Object.prototype.hasOwnProperty.call(payload, 'assignedEmployeeId')) {
    return assetRepository.update(id, await normalizeAssignment(payload));
  }
  return assetRepository.update(id, payload);
};

const deleteAsset = async (id) => {
  await getAsset(id);
  return assetRepository.remove(id);
};

const assignAsset = async (assetId, employeeId, remarks) => {
  const asset = await getAsset(assetId);
  if (!['IN_OFFICE', 'RETURNED'].includes(asset.status)) {
    throw new AppError('Asset can only be assigned or reassigned while in office', 409);
  }
  const resolvedEmployeeId = await resolveEmployeeId(employeeId);
  return assetRepository.update(assetId, {
    assignedEmployeeId: resolvedEmployeeId,
    assignedDate: new Date(),
    remarks
  });
};

const reassignAsset = assignAsset;

const assetHistory = async (id) => {
  await getAsset(id);
  return assetRepository.history(id);
};

module.exports = { createAsset, listAssets, getAsset, updateAsset, deleteAsset, assignAsset, reassignAsset, assetHistory };
