const router = require('express').Router();
const controller = require('../controllers/scannerController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const roles = require('../constants/roles');
const validator = require('../validators/scannerValidator');

router.use(auth);
router.post('/exit', authorize(roles.SUPER_ADMIN, roles.RECEPTION), validate(validator.scan), controller.exit);
router.post('/entry', authorize(roles.SUPER_ADMIN, roles.RECEPTION), validate(validator.scan), controller.entry);
router.post('/maintenance', authorize(roles.SUPER_ADMIN, roles.RECEPTION), validate(validator.scan), controller.maintenance);

module.exports = router;
