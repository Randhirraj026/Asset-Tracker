const router = require('express').Router();
const controller = require('../controllers/qrController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const roles = require('../constants/roles');
const validator = require('../validators/qrValidator');

router.use(auth);
router.post('/generate', authorize(roles.SUPER_ADMIN, roles.ASSET_MANAGER), validate(validator.generate), controller.generate);
router.post('/verify', validate(validator.verify), controller.verify);

module.exports = router;
