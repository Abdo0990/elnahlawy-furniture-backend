const express = require('express');
const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
} = require('../controllers/productController');

const {
    createProductValidator,
    getProductValidator,
    updateProductValidator,
    deleteProductValidator,
} = require('../validators/productValidator');

const { uploadMultipleImages } = require('../middlewares/uploadImageMiddleware');
const { protect, allowedTo } = require('../middlewares/authMiddleware');
const {
    cacheResponse,
    invalidateCacheOnMutation,
} = require('../middlewares/cacheMiddleware');

const router = express.Router();

router.use(invalidateCacheOnMutation('products'));

router
    .route('/')
    .get(cacheResponse('products'), getProducts)
    .post(
        protect,
        allowedTo('admin'),
        uploadMultipleImages('images', 5, 'elnahlawy-furniture/products'),
        createProductValidator,
        createProduct
    );

router
    .route('/:id')
    .get(getProductValidator, cacheResponse('products'), getProduct)
    .put(
        protect,
        allowedTo('admin'),
        uploadMultipleImages('images', 5, 'elnahlawy-furniture/products', true),
        updateProductValidator,
        updateProduct
    )
    .delete(
        protect,
        allowedTo('admin'),
        deleteProductValidator,
        deleteProduct
    );

module.exports = router;
