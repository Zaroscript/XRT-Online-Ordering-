"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = void 0;
const multer_1 = __importDefault(require("multer"));
const CloudinaryStorage_1 = require("../../infrastructure/cloudinary/CloudinaryStorage");
// const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'icon') {
        if (file.mimetype === 'image/svg+xml') {
            cb(null, true);
        }
        else {
            cb(new Error('Only SVG files are allowed for icons'));
        }
    }
    else if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new Error('Only image files are allowed'));
    }
};
exports.uploadImage = (0, multer_1.default)({
    storage: CloudinaryStorage_1.storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});
