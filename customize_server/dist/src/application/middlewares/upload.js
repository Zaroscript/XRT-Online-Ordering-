"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = exports.uploadAttachment = exports.uploadImage = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const CloudinaryStorage_1 = require("../../infrastructure/cloudinary/CloudinaryStorage");
const env_1 = require("../../shared/config/env");
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new Error('Only image files are allowed'));
    }
};
const memoryStorage = multer_1.default.memoryStorage();
/** Disk storage for attachments when Cloudinary is not configured (e.g. local dev) */
const uploadsDir = path_1.default.join(process.cwd(), 'uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
const diskStorage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path_1.default.extname(file.originalname) || '.jpg';
        cb(null, `${unique}${ext}`);
    },
});
/** Attachments (hero slides, logos, etc.): local disk by default. Set ATTACHMENT_STORAGE=cloudinary to use Cloudinary. */
const attachmentStorage = env_1.env.ATTACHMENT_STORAGE === 'cloudinary' ? CloudinaryStorage_1.storage : diskStorage;
exports.uploadImage = (0, multer_1.default)({
    storage: memoryStorage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});
/** Multer for attachment route: Cloudinary or disk so response has thumbnail/original URLs */
exports.uploadAttachment = (0, multer_1.default)({
    storage: attachmentStorage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});
// Memory storage for CSV/ZIP imports (no need to save to cloud)
const importFileFilter = (req, file, cb) => {
    // Allow CSV and ZIP files
    if (file.mimetype === 'text/csv' ||
        file.mimetype === 'application/csv' ||
        file.mimetype === 'application/zip' ||
        file.originalname.endsWith('.csv') ||
        file.originalname.endsWith('.zip')) {
        cb(null, true);
    }
    else {
        cb(new Error('Only CSV or ZIP files are allowed for imports'));
    }
};
exports.upload = (0, multer_1.default)({
    storage: memoryStorage,
    fileFilter: importFileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB for imports
    },
});
