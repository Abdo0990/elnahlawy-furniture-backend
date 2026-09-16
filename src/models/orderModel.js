const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        customerName: {
            type: String,
            required: [true, 'اسم العميل مطلوب'],
            trim: true,
            minlength: [3, 'اسم العميل قصير جداً'],
            maxlength: [100, 'اسم العميل طويل جداً'],
        },
        customerPhone: {
            type: String,
            required: [true, 'رقم هاتف العميل مطلوب'],
            trim: true,
        },
        address: {
            city: {
                type: String,
                required: [true, 'المدينة / المحافظة مطلوبة'],
                trim: true,
            },
            details: {
                type: String,
                required: [true, 'تفاصيل العنوان مطلوبة'],
                trim: true,
            },
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: [true, 'معرف المنتج مطلوب'],
                },
                name: {
                    type: String,
                    required: [true, 'اسم المنتج وقت الطلب مطلوب'],
                },
                price: {
                    type: Number,
                    required: [true, 'سعر المنتج وقت الطلب مطلوب'],
                },
                quantity: {
                    type: Number,
                    default: 1,
                    min: [1, 'أقل كمية هي 1'],
                },
                image: String,
            },
        ],
        totalPrice: {
            type: Number,
            required: true,
            min: [0, 'السعر الإجمالي غير صالح'],
        },
        notes: {
            type: String,
            trim: true,
            default: '',
        },
        status: {
            type: String,
            enum: ['معلق', 'تم التواصل', 'قيد التنفيذ', 'تم التسليم', 'ملغي'],
            default: 'معلق',
        },
        whatsappMessage: {
            type: String,
            default: '',
        },
    },
    { timestamps: true }
);

// فهرس لتسريع الفرز بحسب تاريخ الطلب والحالة للوحة الإدارة
orderSchema.index({ createdAt: -1, status: 1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;