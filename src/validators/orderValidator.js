const { check } = require('express-validator');
const validatorMiddleware = require('../middlewares/validatorMiddleware');

exports.createOrderValidator = [
    check('customerName')
        .trim()
        .notEmpty()
        .withMessage('اسم العميل مطلوب')
        .isLength({ min: 3 })
        .withMessage('الاسم قصير جداً (3 أحرف على الأقل)')
        .isLength({ max: 100 })
        .withMessage('الاسم طويل جداً'),

    check('customerPhone')
        .trim()
        .notEmpty()
        .withMessage('رقم هاتف العميل مطلوب')
        .isMobilePhone(['ar-EG', 'ar-SA', 'ar-AE'])
        .withMessage('يرجى إدخال رقم هاتف صحيح'),

    check('address.city')
        .trim()
        .notEmpty()
        .withMessage('المحافظة / المدينة مطلوبة'),

    check('address.details')
        .trim()
        .notEmpty()
        .withMessage('تفاصيل العنوان مطلوبة'),

    check('items')
        .isArray({ min: 1 })
        .withMessage('يجب اختيار منتج واحد على الأقل لإتمام الطلب'),

    check('items.*.product')
        .notEmpty()
        .withMessage('معرف المنتج مطلوب')
        .isMongoId()
        .withMessage('معرف المنتج غير صالح'),

    check('items.*.quantity')
        .optional()
        .isInt({ min: 1 })
        .withMessage('الكمية يجب أن تكون عدداً صحيحاً لا يقل عن 1'),

    check('notes')
        .optional()
        .trim()
        .isString(),

    validatorMiddleware,
];

exports.getOrderValidator = [
    check('id')
        .isMongoId()
        .withMessage('معرف الطلب غير صالح'),
    validatorMiddleware,
];

exports.updateOrderStatusValidator = [
    check('id')
        .isMongoId()
        .withMessage('معرف الطلب غير صالح'),
    check('status')
        .notEmpty()
        .withMessage('حالة الطلب مطلوبة')
        .isIn(['معلق', 'تم التواصل', 'قيد التنفيذ', 'تم التسليم', 'ملغي'])
        .withMessage('حالة الطلب غير معتمدة'),
    validatorMiddleware,
];

exports.deleteOrderValidator = [
    check('id')
        .isMongoId()
        .withMessage('معرف الطلب غير صالح'),
    validatorMiddleware,
];