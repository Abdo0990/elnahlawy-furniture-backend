const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const User = require('../models/userModel');

exports.generateToken = (userId) =>
    jwt.sign({ userId }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRE_TIME || '30d',
    });

exports.protect = asyncHandler(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new ApiError('يرجى تسجيل الدخول للوصول إلى هذه اللوحة', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
        return next(new ApiError('المستخدم صاحب هذا الرمز لم يعد موجوداً', 401));
    }

    if (!currentUser.isActive) {
        return next(new ApiError('تم تعطيل هذا الحساب', 401));
    }

    if (currentUser.passwordChangedAt) {
        const passChangedTimestamp = parseInt(currentUser.passwordChangedAt.getTime() / 1000, 10);
        if (passChangedTimestamp > decoded.iat) {
            return next(new ApiError('تم تغيير كلمة المرور مؤخراً، يرجى إعادة تسجيل الدخول', 401));
        }
    }

    req.user = currentUser;
    next();
});

exports.allowedTo = (...roles) =>
    asyncHandler(async (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ApiError('غير مصرح لك بتنفيذ هذه العملية', 403));
        }
        next();
    });