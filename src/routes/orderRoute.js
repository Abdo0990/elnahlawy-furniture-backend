const express = require('express');
const {
    createOrder,
    getOrders,
    getOrderStatusCounts,
    getOrder,
    updateOrderStatus,
    deleteOrder,
} = require('../controllers/orderController');

const {
    createOrderValidator,
    getOrderValidator,
    updateOrderStatusValidator,
    deleteOrderValidator,
} = require('../validators/orderValidator');

const { protect, allowedTo } = require('../middlewares/authMiddleware');

const router = express.Router();

// إنشاء الطلب متاح للعامة بدون تسجيل
router.route('/').post(createOrderValidator, createOrder);

// لوحة إدارة المعرض: عرض وتحديث وحذف الطلبات محصورة على الأدمن فقط
router.use(protect, allowedTo('admin'));

router.route('/').get(getOrders);
router.get('/status-counts', getOrderStatusCounts);
router
    .route('/:id')
    .get(getOrderValidator, getOrder)
    .delete(deleteOrderValidator, deleteOrder);
router.route('/:id/status').put(updateOrderStatusValidator, updateOrderStatus);

module.exports = router;
