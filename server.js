const dotenv = require('dotenv');
dotenv.config();

// معالجة الأخطاء غير الملتقطة قبل أي كود آخر
process.on('uncaughtException', (err) => {
    console.error(`Uncaught Exception: ${err.name} | ${err.message}`);
    process.exit(1);
});

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

// استدعاء ملفات المشروع
const dbConnection = require('./src/config/db');
const ApiError = require('./src/utils/apiError');
const globalError = require('./src/middlewares/errorMiddleware');

const productRoute = require('./src/routes/productRoute');
const authRoute = require('./src/routes/authRoute');
const orderRoute = require('./src/routes/orderRoute');
const deliveryRoute = require('./src/routes/deliveryRoute');

// الاتصال بقاعدة البيانات
dbConnection();

const app = express();

// حزم الأمان ومعالجة الطلبات
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json({ limit: '10kb' }));

// حماية ضد NoSQL Injection تشمل الـ query والـ body والـ params
app.use((req, res, next) => {
    if (req.body) mongoSanitize.sanitize(req.body);
    if (req.params) mongoSanitize.sanitize(req.params);
    if (req.query) mongoSanitize.sanitize(req.query);
    next();
});

// المسارات الأساسية
app.use('/api/v1/products', productRoute);
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/orders', orderRoute);
app.use('/api/v1/deliveries', deliveryRoute);

// اصطياد المسارات غير المعرفة (404 Not Found)
app.use((req, res, next) => {
    next(new ApiError(`Can't find this route: ${req.originalUrl}`, 404));
});

// الميدلوير المركزي للأخطاء
app.use(globalError);

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// معالجة الوعود غير المعالجة (Unhandled Rejections)
process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection Error: ${err.name} | ${err.message}`);
    server.close(() => {
        console.error('Shutting down server due to unhandled rejection...');
        process.exit(1);
    });
});
