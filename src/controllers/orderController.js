const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const factory = require('./handlersFactory');
const ApiError = require('../utils/apiError');

// @desc    إنشاء طلب جديد وتوليد رابط الواتساب
// @route   POST /api/v1/orders
// @access  Public
exports.createOrder = asyncHandler(async (req, res, next) => {
    const { customerName, customerPhone, address, items, notes } = req.body;

    // استخراج كافة المعرفات للاستعلام دفعة واحدة
    const productIds = items.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } });

    // ماب لتسريع عملية البحث في الذاكرة O(1)
    const productMap = new Map();
    products.forEach((prod) => productMap.set(prod._id.toString(), prod));

    let calculatedTotalPrice = 0;
    const verifiedItems = [];

    for (const item of items) {
        const product = productMap.get(item.product.toString());
        if (!product) {
            return next(new ApiError(`المنتج غير موجود أو تم حذفه: ${item.product}`, 404));
        }

        const quantity = item.quantity || 1;
        const itemTotal = product.price * quantity;
        calculatedTotalPrice += itemTotal;

        verifiedItems.push({
            product: product._id,
            name: product.name,
            price: product.price,
            quantity,
            image: product.images && product.images.length > 0 ? product.images[0] : '',
        });
    }

    // بناء نص رسالة الواتساب المنظمة
    const messageLines = [
        `*طلب جديد من معرض النحلاوي للأثاث* 🛋️`,
        `--------------------------------`,
        `*اسم العميل:* ${customerName}`,
        `*رقم الهاتف:* ${customerPhone}`,
        `*العنوان:* ${address.city} - ${address.details}`,
        `--------------------------------`,
        `*المنتجات المطلوبة:*`,
    ];

    verifiedItems.forEach((item, index) => {
        messageLines.push(
            `${index + 1}. ${item.name} | العدد: ${item.quantity} | السعر: ${item.price * item.quantity} ج.م`
        );
    });

    messageLines.push(`--------------------------------`);
    messageLines.push(`*إجمالي الطلب:* ${calculatedTotalPrice} ج.م`);

    if (notes) {
        messageLines.push(`*ملاحظات:* ${notes}`);
    }

    const rawMessage = messageLines.join('\n');
    const encodedMessage = encodeURIComponent(rawMessage);

    // رقم واتساب المعرض من الـ .env (مع كود الدولة مثل 2010xxxxxxxx)
    const businessPhone = process.env.WHATSAPP_PHONE || '201013111973';
    const whatsappUrl = `https://wa.me/${businessPhone}?text=${encodedMessage}`;

    // حفظ الطلب في قاعدة البيانات للأرشيف ولوحة الإدارة
    const order = await Order.create({
        customerName,
        customerPhone,
        address,
        items: verifiedItems,
        totalPrice: calculatedTotalPrice,
        notes,
        whatsappMessage: rawMessage,
    });

    res.status(201).json({
        status: 'success',
        message: 'تم تسجيل الطلب بنجاح وتجهيز رابط الواتساب',
        data: {
            order,
            whatsappUrl,
        },
    });
});

// @desc    جلب جميع الطلبات للوحة الإدارة
// @route   GET /api/v1/orders
// @access  Private/Admin
exports.getOrders = factory.getAll(Order);

// @desc    جلب عدد الطلبات في كل حالة لواجهة الفلترة
// @route   GET /api/v1/orders/status-counts
// @access  Private/Admin
exports.getOrderStatusCounts = asyncHandler(async (req, res) => {
    const statuses = ['معلق', 'تم التواصل', 'قيد التنفيذ', 'تم التسليم', 'ملغي'];
    const groupedCounts = await Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const counts = Object.fromEntries(statuses.map((status) => [status, 0]));
    groupedCounts.forEach(({ _id, count }) => {
        if (Object.hasOwn(counts, _id)) counts[_id] = count;
    });

    res.status(200).json({
        status: 'success',
        data: {
            total: groupedCounts.reduce((total, item) => total + item.count, 0),
            counts,
        },
    });
});

// @desc    جلب تفاصيل طلب محدد
// @route   GET /api/v1/orders/:id
// @access  Private/Admin
exports.getOrder = factory.getOne(Order);

// @desc    تحديث حالة الطلب (معلق / تم التواصل / تم التسليم ...)
// @route   PUT /api/v1/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
        id,
        { status },
        { returnDocument: 'after', runValidators: true }
    );

    if (!order) {
        return next(new ApiError(`لا يوجد طلب بهذا المعرف: ${id}`, 404));
    }

    res.status(200).json({
        status: 'success',
        message: 'تم تحديث حالة الطلب بنجاح',
        data: order,
    });
});

// @desc    حذف طلب من الأرشيف
// @route   DELETE /api/v1/orders/:id
// @access  Private/Admin
exports.deleteOrder = factory.deleteOne(Order);
