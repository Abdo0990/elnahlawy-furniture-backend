const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');
const factory = require('./handlersFactory');
const ApiError = require('../utils/apiError');
const { deleteFromCloudinary } = require('../middlewares/uploadImageMiddleware');

// جلب كل المنتجات مع الفلترة والترقيم والبحث
exports.getProducts = factory.getAll(Product);

// جلب منتج محدد
exports.getProduct = factory.getOne(Product);

// إضافة منتج جديد
exports.createProduct = factory.createOne(Product);

// تعديل منتج مع حذف الصور القديمة إذا رُفعت صور جديدة
exports.updateProduct = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (req.body.images && req.body.images.length > 0) {
        const oldProduct = await Product.findById(id);
        if (!oldProduct) {
            return next(new ApiError(`لا يوجد منتج بهذا المعرف: ${id}`, 404));
        }

        if (oldProduct.images && oldProduct.images.length > 0) {
            const deletePromises = oldProduct.images.map((imgUrl) =>
                deleteFromCloudinary(imgUrl)
            );
            await Promise.all(deletePromises);
        }
    }

    const product = await Product.findByIdAndUpdate(id, req.body, {
        returnDocument: 'after',
        runValidators: true,
    });

    if (!product) {
        return next(new ApiError(`لا يوجد منتج بهذا المعرف: ${id}`, 404));
    }

    res.status(200).json({
        status: 'success',
        message: 'تم تعديل المنتج بنجاح',
        data: product,
    });
});

// حذف منتج مع مسح صوره من Cloudinary
exports.deleteProduct = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
        return next(new ApiError(`لا يوجد منتج بهذا المعرف: ${id}`, 404));
    }

    if (product.images && product.images.length > 0) {
        const deletePromises = product.images.map((imgUrl) =>
            deleteFromCloudinary(imgUrl)
        );
        await Promise.all(deletePromises);
    }

    res.status(200).json({
        status: 'success',
        message: 'تم حذف المنتج وصوره بنجاح',
        data: null,
    });
});