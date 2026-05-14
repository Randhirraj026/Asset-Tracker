const router = require('express').Router();
const controller = require('../controllers/logController');
const scannerController = require('../controllers/scannerController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const roles = require('../constants/roles');
const validator = require('../validators/logValidator');
const scannerValidator = require('../validators/scannerValidator');
const { uuidParam } = require('../validators/commonSchemas');

router.use(auth);
router.get('/', validate(validator.list), controller.list);
router.post('/scan', authorize(roles.SUPER_ADMIN, roles.RECEPTION), validate(scannerValidator.selectedScan), scannerController.scan);
router.get('/employee/:id', validate(uuidParam), controller.byEmployee);
router.get('/asset/:id', validate(uuidParam), controller.byAsset);

module.exports = router;
