const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');
const ApiError = require('../utils/apiError');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    const allowedExtensions = /\.(jpg|jpeg|png|webp)$/i;
    const isMimeAllowed = file.mimetype.startsWith('image/');
    const isExtAllowed = allowedExtensions.test(file.originalname);

    if (isMimeAllowed && isExtAllowed) {
        cb(null, true);
    } else {
        cb(new ApiError('يسمح فقط بالصور بصيغة (jpg, jpeg, png, webp)', 400), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadToCloudinary = (buffer, folder = 'elnahlawy-furniture/products') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'image',
                transformation: [
                    { width: 1200, crop: 'limit' },
                    { quality: 'auto:good' },
                    { fetch_format: 'auto' },
                ],
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );

        const stream = Readable.from(buffer);
        stream.pipe(uploadStream);
    });
};

exports.uploadSingleImage = (fieldName, folder = 'elnahlawy-furniture/products') => {
    const multerUpload = upload.single(fieldName);

    return (req, res, next) => {
        multerUpload(req, res, async (err) => {
            if (err) return next(new ApiError(err.message, 400));

            if (req.file) {
                try {
                    const result = await uploadToCloudinary(req.file.buffer, folder);
                    req.body[fieldName] = result.secure_url;
                } catch {
                    return next(new ApiError('فشل رفع الصورة إلى السحابة', 500));
                }
            }
            next();
        });
    };
};

exports.uploadMultipleImages = (fieldName, maxCount = 5, folder = 'elnahlawy-furniture/products', isOptional = false) => {
    const multerUpload = upload.array(fieldName, maxCount);

    return (req, res, next) => {
        multerUpload(req, res, async (err) => {
            if (err) return next(new ApiError(err.message, 400));

            if (!req.files || req.files.length === 0) {
                if (isOptional) {
                    return next();
                }
                return next(new ApiError('يجب رفع صورة واحدة على الأقل', 400));
            }

            try {
                const uploadPromises = req.files.map((file) =>
                    uploadToCloudinary(file.buffer, folder)
                );
                const results = await Promise.all(uploadPromises);
                req.body[fieldName] = results.map((result) => result.secure_url);
                next();
            } catch (uploadError) {
                return next(new ApiError(`فشل في رفع الصور إلى السحابة: ${uploadError.message || uploadError}`, 500));
            }
        });
    };
};

exports.deleteFromCloudinary = async (imageUrl) => {
    if (!imageUrl || !imageUrl.includes('cloudinary.com')) return;
    try {
        const parts = imageUrl.split('/');
        const uploadIndex = parts.indexOf('upload');
        if (uploadIndex === -1) return;

        const pathAfterUpload = parts.slice(uploadIndex + 1);
        if (pathAfterUpload[0].startsWith('v')) pathAfterUpload.shift();

        const publicIdWithExt = pathAfterUpload.join('/');
        const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.'));

        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error.message);
    }
};