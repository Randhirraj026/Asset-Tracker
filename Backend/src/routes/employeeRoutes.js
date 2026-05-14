const router = require('express').Router();
const controller = require('../controllers/employeeController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const roles = require('../constants/roles');
const validator = require('../validators/employeeValidator');

router.use(auth);
router.get('/', validate(validator.list), controller.list);
router.post('/', authorize(roles.SUPER_ADMIN, roles.ASSET_MANAGER), validate(validator.create), controller.create);
router.get('/:id/history', validate(validator.id), controller.history);
router.get('/:id', validate(validator.id), controller.get);
router.put('/:id', authorize(roles.SUPER_ADMIN, roles.ASSET_MANAGER), validate(validator.update), controller.update);
router.delete('/:id', authorize(roles.SUPER_ADMIN), validate(validator.id), controller.remove);

module.exports = router;
