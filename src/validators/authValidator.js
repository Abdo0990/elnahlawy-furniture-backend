const { check } = require('express-validator');
const validatorMiddleware = require('../middlewares/validatorMiddleware');

exports.loginValidator = [
    check('email')
        .notEmpty()
        .withMessage('البريد الإلكتروني مطلوب')
        .isEmail()
        .withMessage('صيغة البريد الإلكتروني غير صحيحة')
        .toLowerCase(),

    check('password')
        .notEmpty()
        .withMessage('كلمة المرور مطلوبة'),

    validatorMiddleware,
];