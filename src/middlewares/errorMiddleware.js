const ApiError = require('../utils/apiError');

const handleJwtInvalidSignature = () =>
    new ApiError('رمز الدخول غير صالح، يرجى تسجيل الدخول مجدداً', 401);

const handleJwtExpired = () =>
    new ApiError('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً', 401);

const handleCastErrorDB = (err) =>
    new ApiError(`معرف غير صالح '${err.value}' للحقل: ${err.path}`, 400);

const handleDuplicateFieldsDB = (err) => {
    const field = Object.keys(err.keyValue || {})[0] || 'الحقل';
    return new ApiError(`القيمة المدخلة للحقل '${field}' مستخدمة بالفعل، يرجى اختيار قيمة أخرى`, 400);
};

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    return new ApiError(`بيانات غير صحيحة: ${errors.join('. ')}`, 400);
};

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};

const sendErrorProd = (err, res) => {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    } else {
        console.error('ERROR 💥:', err);
        res.status(500).json({
            status: 'error',
            message: 'حدث خطأ غير متوقع في الخادم!',
        });
    }
};

const globalError = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else {
        let error = Object.assign(Object.create(Object.getPrototypeOf(err)), err);
        error.message = err.message;
        error.name = err.name;
        error.code = err.code;

        if (error.name === 'JsonWebTokenError') error = handleJwtInvalidSignature();
        if (error.name === 'TokenExpiredError') error = handleJwtExpired();
        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === 'ValidationError') error = handleValidationErrorDB(error);

        sendErrorProd(error, res);
    }
};

module.exports = globalError;