const router = require('express').Router();
const controller = require('../controllers/assetController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const roles = require('../constants/roles');
const validator = require('../validators/assetValidator');

router.use(auth);
router.get('/', validate(validator.list), controller.list);
router.post('/', authorize(roles.SUPER_ADMIN, roles.ASSET_MANAGER), validate(validator.create), controller.create);
router.post('/:id/assign', authorize(roles.SUPER_ADMIN, roles.ASSET_MANAGER), validate(validator.assign), controller.assign);
router.post('/:id/reassign', authorize(roles.SUPER_ADMIN, roles.ASSET_MANAGER), validate(validator.assign), controller.assign);
router.get('/:id/history', validate(validator.id), controller.history);
router.get('/:id', validate(validator.id), controller.get);
router.put('/:id', authorize(roles.SUPER_ADMIN, roles.ASSET_MANAGER), validate(validator.update), controller.update);
router.delete('/:id', authorize(roles.SUPER_ADMIN), validate(validator.id), controller.remove);

module.exports = router;
