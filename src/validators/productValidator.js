const { check } = require('express-validator');
const validatorMiddleware = require('../middlewares/validatorMiddleware');

exports.createProductValidator = [
    check('name')
        .trim()
        .notEmpty()
        .withMessage('اسم المنتج مطلوب')
        .isLength({ min: 3 })
        .withMessage('اسم المنتج قصير جداً (3 أحرف على الأقل)')
        .isLength({ max: 100 })
        .withMessage('اسم المنتج طويل جداً (100 حرف كحد أقصى)'),

    check('description')
        .trim()
        .notEmpty()
        .withMessage('وصف المنتج مطلوب')
        .isLength({ min: 10 })
        .withMessage('الوصف يجب ألا يقل عن 10 أحرف'),

    check('price')
        .notEmpty()
        .withMessage('سعر المنتج مطلوب')
        .isNumeric()
        .withMessage('السعر يجب أن يكون رقماً')
        .custom((val) => {
            if (Number(val) < 0) {
                throw new Error('السعر لا يمكن أن يكون سالباً');
            }
            return true;
        }),

    check('category')
        .trim()
        .notEmpty()
        .withMessage('فئة المنتج مطلوبة')
        .isIn(['غرف نوم', 'صالونات', 'سفرة', 'مطابخ'])
        .withMessage('الفئة المختارة غير صحيحة، يجب أن تكون (غرف نوم، صالونات، سفرة، مطابخ)'),

    check('woodType')
        .trim()
        .notEmpty()
        .withMessage('نوع الخشب مطلوب'),

    check('dimensions')
        .optional()
        .trim()
        .isString()
        .withMessage('الأبعاد يجب أن تكون نصاً'),

    check('images')
        .notEmpty()
        .withMessage('يجب رفع صورة واحدة على الأقل للمنتج')
        .isArray({ min: 1 })
        .withMessage('يجب رفع صورة واحدة على الأقل للمنتج'),

    check('isAvailable')
        .optional()
        .isBoolean()
        .withMessage('حالة التوفر يجب أن تكون true أو false'),

    validatorMiddleware,
];

exports.getProductValidator = [
    check('id')
        .isMongoId()
        .withMessage('معرف المنتج غير صحيح (Invalid Mongo ID)'),
    validatorMiddleware,
];

exports.updateProductValidator = [
    check('id')
        .isMongoId()
        .withMessage('معرف المنتج غير صحيح (Invalid Mongo ID)'),

    check('name')
        .optional()
        .trim()
        .isLength({ min: 3 })
        .withMessage('اسم المنتج قصير جداً')
        .isLength({ max: 100 })
        .withMessage('اسم المنتج طويل جداً'),

    check('description')
        .optional()
        .trim()
        .isLength({ min: 10 })
        .withMessage('الوصف يجب ألا يقل عن 10 أحرف'),

    check('price')
        .optional()
        .isNumeric()
        .withMessage('السعر يجب أن يكون رقماً')
        .custom((val) => {
            if (Number(val) < 0) {
                throw new Error('السعر لا يمكن أن يكون سالباً');
            }
            return true;
        }),

    check('category')
        .optional()
        .trim()
        .isIn(['غرف نوم', 'صالونات', 'سفرة', 'مطابخ'])
        .withMessage('الفئة المختارة غير صحيحة'),

    check('woodType')
        .optional()
        .trim(),

    check('dimensions')
        .optional()
        .trim(),

    check('images')
        .optional()
        .isArray({ min: 1 })
        .withMessage('الصور يجب أن تكون في مصفوفة'),

    check('isAvailable')
        .optional()
        .isBoolean()
        .withMessage('حالة التوفر يجب أن تكون true أو false'),

    validatorMiddleware,
];

exports.deleteProductValidator = [
    check('id')
        .isMongoId()
        .withMessage('معرف المنتج غير صحيح (Invalid Mongo ID)'),
    validatorMiddleware,
];