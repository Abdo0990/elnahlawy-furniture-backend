const asyncHandler = require('express-async-handler');
const Delivery = require('../models/deliveryModel');
const factory = require('./handlersFactory');
const ApiError = require('../utils/apiError');
const { deleteFromCloudinary } = require('../middlewares/uploadImageMiddleware');

// جلب كل التسليمات (متاحة للعامة)
exports.getDeliveries = factory.getAll(Delivery);

// جلب تفاصيل تسليم واحد
exports.getDelivery = factory.getOne(Delivery);

// إضافة تسليم جديد
exports.createDelivery = factory.createOne(Delivery);

// تعديل تسليم موجود مع تنظيف الصور القديمة من السحابة إذا تم استبدالها
exports.updateDelivery = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    // في حال تم رفع صور جديدة عبر الميدلوير
    if (req.body.images && req.body.images.length > 0) {
        const oldDelivery = await Delivery.findById(id);
        if (!oldDelivery) {
            return next(new ApiError(`لا يوجد تسليم بهذا المعرف: ${id}`, 404));
        }

        // مسح الصور القديمة لمنع تضخم المساحة
        if (oldDelivery.images && oldDelivery.images.length > 0) {
            const deletePromises = oldDelivery.images.map((imgUrl) =>
                deleteFromCloudinary(imgUrl)
            );
            await Promise.all(deletePromises);
        }
    }

    const delivery = await Delivery.findByIdAndUpdate(id, req.body, {
        returnDocument: 'after',
        runValidators: true,
    });

    if (!delivery) {
        return next(new ApiError(`لا يوجد تسليم بهذا المعرف: ${id}`, 404));
    }

    res.status(200).json({
        status: 'success',
        message: 'تم تحديث التسليم بنجاح',
        data: delivery,
    });
});

// حذف تسليم مع تنظيف الصور من سحابة Cloudinary
exports.deleteDelivery = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const delivery = await Delivery.findByIdAndDelete(id);

    if (!delivery) {
        return next(new ApiError(`لا يوجد تسليم بهذا المعرف: ${id}`, 404));
    }

    // مسح الصور المرتبطة بالتسليم من Cloudinary
    if (delivery.images && delivery.images.length > 0) {
        const deletePromises = delivery.images.map((imgUrl) =>
            deleteFromCloudinary(imgUrl)
        );
        await Promise.all(deletePromises);
    }

    res.status(200).json({
        status: 'success',
        message: 'تم حذف التسليم وصوره بنجاح',
        data: null,
    });
});