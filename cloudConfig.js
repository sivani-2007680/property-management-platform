const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


const cloudName = process.env.CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_KEY || process.env.CLOUD_API_KEY;
const apiSecret = process.env.CLOUDINARY_SECRET || process.env.CLOUD_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
    console.warn("Cloudinary credentials are not fully set. Image uploads will fail until you set CLOUD_NAME and CLOUDINARY_KEY / CLOUD_API_KEY and CLOUDINARY_SECRET / CLOUD_API_SECRET in .env");
}

cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
});

 
let storage;


const isPlaceholder = (val) => {
    if (!val) return true;
    const lower = String(val).toLowerCase();
    return lower.includes('your_') || lower.includes('placeholder') || lower.includes('example') || lower === 'your_cloudinary_key' || lower === 'your_cloudinary_secret';
};

const credsValid = !(isPlaceholder(cloudName) || isPlaceholder(apiKey) || isPlaceholder(apiSecret));

if (credsValid) {
    storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'WANDERLUST_DEV',
            allowedFormats: ["png", "jpg", "jpeg"],
        },
    });
} else {
    
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, uploadDir);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const ext = path.extname(file.originalname);
            cb(null, file.fieldname + '-' + uniqueSuffix + ext);
        }
    });
    console.warn('Cloudinary credentials not valid — using local disk storage for uploads at', uploadDir);
}

module.exports = {
    cloudinary,
    storage
};