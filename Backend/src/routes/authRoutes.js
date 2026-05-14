const router = require('express').Router();
const controller = require('../controllers/authController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const validator = require('../validators/authValidator');

router.post('/login', authLimiter, validate(validator.login), controller.login);
router.post('/logout', auth, controller.logout);
router.get('/me', auth, controller.me);

module.exports = router;
