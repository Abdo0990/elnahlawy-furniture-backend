const { check } = require('express-validator');
const validatorMiddleware = require('../middlewares/validatorMiddleware');

exports.createDeliveryValidator = [
    check('title')
        .trim()
        .notEmpty()
        .withMessage('عنوان التسليم مطلوب')
        .isLength({ min: 3 })
        .withMessage('العنوان قصير جداً')
        .isLength({ max: 100 })
        .withMessage('العنوان طويل جداً'),

    check('location')
        .trim()
        .notEmpty()
        .withMessage('مكان التسليم مطلوب'),

    check('clientName')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('اسم العميل طويل جداً'),

    check('description')
        .optional()
        .trim()
        .isString(),

    check('images')
        .notEmpty()
        .withMessage('يجب رفع صورة واحدة على الأقل للتسليم')
        .isArray({ min: 1 })
        .withMessage('يجب رفع صورة واحدة على الأقل للتسليم'),

    validatorMiddleware,
];

exports.getDeliveryValidator = [
    check('id').isMongoId().withMessage('معرف التسليم غير صالح'),
    validatorMiddleware,
];

exports.updateDeliveryValidator = [
    check('id').isMongoId().withMessage('معرف التسليم غير صالح'),
    check('title')
        .optional()
        .trim()
        .isLength({ min: 3 })
        .withMessage('العنوان قصير جداً')
        .isLength({ max: 100 })
        .withMessage('العنوان طويل جداً'),
    check('location')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('مكان التسليم لا يمكن أن يكون فارغاً'),
    check('clientName')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('اسم العميل طويل جداً'),
    check('description')
        .optional()
        .trim()
        .isString(),
    check('images')
        .optional()
        .isArray({ min: 1 })
        .withMessage('الصور يجب أن تكون في مصفوفة'),
    validatorMiddleware,
];

exports.deleteDeliveryValidator = [
    check('id').isMongoId().withMessage('معرف التسليم غير صالح'),
    validatorMiddleware,
];