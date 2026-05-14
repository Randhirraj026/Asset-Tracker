const authService = require('../services/authService');
const auditService = require('../services/auditService');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.validated.body);
  req.user = result.admin;
  await auditService.record(req, 'LOGIN', 'AUTH');
  return success(res, 'Login successful', result);
});

const logout = asyncHandler(async (req, res) => {
  await auditService.record(req, 'LOGOUT', 'AUTH');
  return success(res, 'Logout successful');
});

const me = asyncHandler(async (req, res) => {
  return success(res, 'Authenticated user fetched successfully', authService.sanitizeAdmin(req.user));
});

module.exports = { login, logout, me };
