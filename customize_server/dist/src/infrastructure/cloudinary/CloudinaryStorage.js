"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryStorage = exports.storage = void 0;
const cloudinary_1 = require("cloudinary");
const multer_storage_cloudinary_1 = __importDefault(require("multer-storage-cloudinary"));
const env_1 = require("../../shared/config/env");
cloudinary_1.v2.config({
    cloud_name: env_1.env.CLOUDINARY_NAME,
    api_key: env_1.env.CLOUDINARY_API_KEY,
    api_secret: env_1.env.CLOUDINARY_API_SECRET,
});
exports.storage = (0, multer_storage_cloudinary_1.default)({
    cloudinary: cloudinary_1.v2,
    params: async (req, file) => {
        let folder = 'xrttech';
        // Check if section is explicitly passed in body
        let section = req.body?.section;
        if (!section) {
            // Attempt to parse the section from the URL
            // e.g., /api/v1/categories => categories
            // e.g., /api/v1/products => products
            // e.g., /api/v1/shops => shops
            const urlParts = req.baseUrl ? req.baseUrl.split('/') : [];
            // Usually url is like /api/v1/categories, so taking the last part is a good heuristic
            // If baseUrl is empty, try originalUrl
            const pathSegments = req.baseUrl ? req.baseUrl.split('/').filter(Boolean) : (req.originalUrl ? req.originalUrl.split('/').filter(Boolean) : []);
            // Look for known entities or default to 'misc'
            const knownEntities = ['categories', 'products', 'shops', 'coupons', 'attributes', 'groups', 'tags', 'users', 'auth'];
            section = pathSegments.find((segment) => knownEntities.includes(segment)) || 'misc';
        }
        folder = `xrttech/${section}`;
        const businessId = req.body?.business_id || req.user?.business_id;
        if (businessId) {
            folder += `/${businessId}`;
        }
        // Check field name from body (passed from uploadClient) OR from file (multer native)
        const fieldName = req.body?.field || file.fieldname;
        if (fieldName === 'icon') {
            folder += '/icons';
        }
        else if (fieldName === 'gallery') {
            folder += '/gallery';
        }
        // Use 'auto' to let Cloudinary automatically detect the resource type
        // This works correctly for SVG files and other image types
        return {
            folder: folder,
            resource_type: 'auto',
        };
    },
});
class CloudinaryStorage {
    async uploadImage(file, folder) {
        if (file.path) {
            return {
                url: file.path,
                secure_url: file.path,
                public_id: file.filename,
            };
        }
        return new Promise((resolve, reject) => {
            const uploadOptions = {
                resource_type: 'image',
                folder: folder ? (folder.startsWith('xrttech') ? folder : `xrttech/${folder}`) : 'xrttech',
            };
            cloudinary_1.v2.uploader
                .upload_stream(uploadOptions, (error, result) => {
                if (error) {
                    return reject(error);
                }
                if (!result) {
                    return reject(new Error('Upload failed: No result from Cloudinary'));
                }
                resolve({
                    url: result.url,
                    public_id: result.public_id,
                    secure_url: result.secure_url,
                });
            })
                .end(file.buffer);
        });
    }
    async deleteImage(public_id) {
        try {
            await cloudinary_1.v2.uploader.destroy(public_id);
        }
        catch (error) {
            console.error('Error deleting image from Cloudinary:', error);
            throw error;
        }
    }
}
exports.CloudinaryStorage = CloudinaryStorage;
