const router = require('express').Router();
const controller = require('../controllers/reportController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const roles = require('../constants/roles');

router.use(auth, authorize(roles.SUPER_ADMIN, roles.ASSET_MANAGER));
router.get('/monthly', controller.monthly);
router.get('/employee', controller.employeeWise);
router.get('/employees', controller.employeeWise);
router.get('/assets', controller.assetWise);
router.get('/overdue', controller.overdue);
router.get('/frequent-assets', controller.frequentAssets);

module.exports = router;
