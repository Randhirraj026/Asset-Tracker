const reportService = require('../services/reportService');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');

const monthly = asyncHandler(async (req, res) => success(res, 'Monthly report fetched successfully', await reportService.monthly(req.query)));
const employeeWise = asyncHandler(async (_req, res) => success(res, 'Employee-wise report fetched successfully', await reportService.employeeWise()));
const assetWise = asyncHandler(async (_req, res) => success(res, 'Asset-wise report fetched successfully', await reportService.assetWise()));
const overdue = asyncHandler(async (req, res) => success(res, 'Overdue assets fetched successfully', await reportService.overdue(req.query)));
const frequentAssets = asyncHandler(async (_req, res) => success(res, 'Frequently moved assets fetched successfully', await reportService.frequentAssets()));

module.exports = { monthly, employeeWise, assetWise, overdue, frequentAssets };
