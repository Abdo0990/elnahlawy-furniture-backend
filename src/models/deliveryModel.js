const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'عنوان التسليم مطلوب (مثل: تسليم صالون كلاسيك)'],
            trim: true,
            minlength: [3, 'العنوان قصير جداً'],
            maxlength: [100, 'العنوان طويل جداً'],
        },
        location: {
            type: String,
            required: [true, 'مكان التسليم مطلوب (مثل: التجمع الخامس، الإسكندرية)'],
            trim: true,
        },
        clientName: {
            type: String,
            trim: true,
            default: 'عميل مميز', // اختياري في حالة العميل مش حابب يذكر اسمه
        },
        description: {
            type: String,
            trim: true,
            default: '',
        },
        images: {
            type: [String],
            validate: [
                (val) => val.length > 0,
                'يجب رفع صورة واحدة على الأقل للتسليم',
            ],
        },
        deliveredAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// فهرس لترتيب التسليمات من الأحدث للأقدم بسرعة
deliverySchema.index({ deliveredAt: -1 });

const Delivery = mongoose.model('Delivery', deliverySchema);

module.exports = Delivery;