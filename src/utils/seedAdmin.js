const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/userModel');

dotenv.config({ path: './.env' });

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.CLOUD_MONGO_URI);
        console.log('تم الاتصال بقاعدة البيانات بنجاح...');

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        const adminName = process.env.ADMIN_NAME;

        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log(`حساب الأدمن (${adminEmail}) موجود بالفعل في قاعدة البيانات.`);
            process.exit(0);
        }

        await User.create({
            name: adminName,
            email: adminEmail,
            password: adminPassword,
            role: 'admin',
        });

        console.log('✅ تم إنشاء حساب الأدمن الرسمي بنجاح!');
        console.log(`الإيميل: ${adminEmail}`);
        process.exit(0);
    } catch (error) {
        console.error('❌ حدث خطأ أثناء إنشاء حساب الأدمن:', error);
        process.exit(1);
    }
};

seedAdmin();