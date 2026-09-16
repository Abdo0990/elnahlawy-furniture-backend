const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'اسم المنتج مطلوب'],
            trim: true,
            minlength: [3, 'اسم المنتج قصير جداً'],
            maxlength: [100, 'اسم المنتج طويل جداً'],
        },
        description: {
            type: String,
            required: [true, 'وصف المنتج مطلوب'],
            trim: true,
            minlength: [10, 'الوصف يجب ألا يقل عن 10 أحرف'],
        },
        price: {
            type: Number,
            required: [true, 'سعر المنتج مطلوب'],
            min: [0, 'السعر لا يمكن أن يكون سالباً'],
        },
        category: {
            type: String,
            required: [true, 'فئة المنتج مطلوبة'],
            enum: {
                values: [
                    'غرف نوم',
                    'غرف أطفال',
                    'ركن',
                    'سفرة',
                    'دواليب',
                    'سراير',
                    'مكاتب',
                    'جزامة',
                ],
                message: '{VALUE} ليست فئة معتمدة',
            },
            trim: true,
        },
        woodType: {
            type: String,
            required: [true, 'نوع الخشب مطلوب'],
            trim: true,
        },
        dimensions: {
            type: String,
            trim: true,
            default: '',
        },
        images: {
            type: [String],
            validate: [
                (val) => val.length > 0,
                'يجب إضافة صورة واحدة على الأقل للمنتج',
            ],
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// فهارس لتحسين الفلترة والبحث السريع
productSchema.index({ category: 1, price: 1, isAvailable: 1 });
productSchema.index({ name: 'text', description: 'text', woodType: 'text' });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;