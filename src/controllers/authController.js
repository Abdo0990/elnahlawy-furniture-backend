const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const ApiError = require('../utils/apiError');
const { generateToken } = require('../middlewares/authMiddleware');

// @desc    تسجيل دخول الأدمن
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return next(new ApiError('البريد الإلكتروني أو كلمة المرور غير صحيحة', 401));
    }

    if (user.role !== 'admin') {
        return next(new ApiError('غير مصرح لك بالدخول إلى لوحة التحكم', 403));
    }

    if (!user.isActive) {
        return next(new ApiError('هذا الحساب معطل حالياً', 401));
    }

    const token = generateToken(user._id);

    res.status(200).json({
        status: 'success',
        message: 'تم تسجيل الدخول بنجاح',
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        token,
    });
});

// @desc    التحقق من هوية الأدمن الحالي
// @route   GET /api/v1/auth/me
// @access  Protected/Admin
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.status(200).json({
        status: 'success',
        data: {
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
        },
    });
});