const employeeRepository = require('../repositories/employeeRepository');
const AppError = require('../utils/AppError');
const { getPagination, paginationMeta } = require('../utils/pagination');

const createEmployee = (payload) => employeeRepository.create(payload);

const listEmployees = async (query) => {
  const { page, limit, skip, take } = getPagination(query);
  const [items, total] = await employeeRepository.list({ skip, take, search: query.search, department: query.department });
  return { items, meta: paginationMeta(page, limit, total) };
};

const getEmployee = async (id) => {
  const employee = await employeeRepository.findById(id);
  if (!employee) throw new AppError('Employee not found', 404);
  return employee;
};

const updateEmployee = async (id, payload) => {
  await getEmployee(id);
  return employeeRepository.update(id, payload);
};

const deleteEmployee = async (id) => {
  await getEmployee(id);
  return employeeRepository.remove(id);
};

const employeeHistory = async (id) => {
  await getEmployee(id);
  return employeeRepository.history(id);
};

module.exports = { createEmployee, listEmployees, getEmployee, updateEmployee, deleteEmployee, employeeHistory };
