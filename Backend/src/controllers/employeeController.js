const employeeService = require('../services/employeeService');
const auditService = require('../services/auditService');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');

const normalize = (body) => {
  const { employeeId, ...rest } = body;
  return { ...rest, empId: body.empId || employeeId };
};

const create = asyncHandler(async (req, res) => {
  const employee = await employeeService.createEmployee(normalize(req.validated.body));
  await auditService.record(req, 'CREATE_EMPLOYEE', 'EMPLOYEES');
  return success(res, 'Employee created successfully', employee, 201);
});

const list = asyncHandler(async (req, res) => {
  const { items, meta } = await employeeService.listEmployees(req.validated.query);
  return success(res, 'Employees fetched successfully', items, 200, meta);
});

const get = asyncHandler(async (req, res) => {
  const employee = await employeeService.getEmployee(req.params.id);
  return success(res, 'Employee fetched successfully', employee);
});

const update = asyncHandler(async (req, res) => {
  const employee = await employeeService.updateEmployee(req.params.id, normalize(req.validated.body));
  await auditService.record(req, 'UPDATE_EMPLOYEE', 'EMPLOYEES');
  return success(res, 'Employee updated successfully', employee);
});

const remove = asyncHandler(async (req, res) => {
  await employeeService.deleteEmployee(req.params.id);
  await auditService.record(req, 'DELETE_EMPLOYEE', 'EMPLOYEES');
  return success(res, 'Employee deleted successfully');
});

const history = asyncHandler(async (req, res) => {
  const logs = await employeeService.employeeHistory(req.params.id);
  return success(res, 'Employee history fetched successfully', logs);
});

module.exports = { create, list, get, update, remove, history };
