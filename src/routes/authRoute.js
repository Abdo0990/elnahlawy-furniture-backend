const express = require('express');
const rateLimit = require('express-rate-limit');
const { login, getLoggedUserData } = require('../controllers/authController');
const { loginValidator } = require('../validators/authValidator');
const { protect, allowedTo } = require('../middlewares/authMiddleware');

const router = express.Router();

// حماية مسار الدخول من التخمين
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        status: 'fail',
        message: 'تم تجاوز عدد محاولات الدخول المسموحة، يرجى المحاولة بعد 15 دقيقة',
    },
});

router.post('/login', loginLimiter, loginValidator, login);
router.get('/me', protect, allowedTo('admin'), getLoggedUserData);

module.exports = router;