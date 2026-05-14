const router = require('express').Router();

router.use('/auth', require('./authRoutes'));
router.use('/employees', require('./employeeRoutes'));
router.use('/assets', require('./assetRoutes'));
router.use('/qr', require('./qrRoutes'));
router.use('/scanner', require('./scannerRoutes'));
router.use('/logs', require('./logRoutes'));
router.use('/reports', require('./reportRoutes'));

module.exports = router;
