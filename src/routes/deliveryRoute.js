const express = require('express');
const {
    getDeliveries,
    getDelivery,
    createDelivery,
    updateDelivery,
    deleteDelivery,
} = require('../controllers/deliveryController');

const {
    createDeliveryValidator,
    getDeliveryValidator,
    updateDeliveryValidator,
    deleteDeliveryValidator,
} = require('../validators/deliveryValidator');

const { uploadMultipleImages } = require('../middlewares/uploadImageMiddleware');
const { protect, allowedTo } = require('../middlewares/authMiddleware');
const {
    cacheResponse,
    invalidateCacheOnMutation,
} = require('../middlewares/cacheMiddleware');

const router = express.Router();

router.use(invalidateCacheOnMutation('deliveries'));

// المسارات العامة (أي حد يقدر يشوف التسليمات)
router.route('/').get(cacheResponse('deliveries'), getDeliveries);
router.route('/:id').get(getDeliveryValidator, cacheResponse('deliveries'), getDelivery);

// المسارات المحمية (المدير فقط يقدر يضيف أو يعدل أو يمسح)
router.use(protect, allowedTo('admin'));

router
    .route('/')
    .post(
        uploadMultipleImages('images', 5, 'elnahlawy-furniture/deliveries'),
        createDeliveryValidator,
        createDelivery
    );

router
    .route('/:id')
    .put(
        protect,
        allowedTo('admin'),
        uploadMultipleImages('images', 5, 'elnahlawy-furniture/deliveries', true),
        updateDeliveryValidator,
        updateDelivery
    )
    .delete(deleteDeliveryValidator, deleteDelivery);

module.exports = router;
