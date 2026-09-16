const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: [true, 'اسم المستخدم مطلوب'],
            minlength: [3, 'الاسم يجب ألا يقل عن 3 أحرف'],
            maxlength: [50, 'الاسم طويل للغاية'],
        },
        email: {
            type: String,
            required: [true, 'البريد الإلكتروني مطلوب'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'كلمة المرور مطلوبة'],
            minlength: [6, 'كلمة المرور يجب ألا تقل عن 6 أحرف'],
            select: false,
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        passwordChangedAt: Date,
    },
    { timestamps: true }
);

userSchema.index({ role: 1 });

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

const User = mongoose.model('User', userSchema);

module.exports = User;