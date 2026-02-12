"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttachmentController = void 0;
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const response_1 = require("../../shared/utils/response");
/** Normalize req.files to an array (multer .any() returns array; some typings use object). */
function normalizeFiles(req) {
    const raw = req.files;
    if (!raw)
        return [];
    if (Array.isArray(raw))
        return raw;
    if (typeof raw === 'object') {
        const list = [];
        Object.values(raw).forEach((v) => {
            if (Array.isArray(v))
                list.push(...v);
            else if (v && typeof v === 'object' && v.originalname)
                list.push(v);
        });
        return list;
    }
    return [];
}
class AttachmentController {
    constructor() {
        this.upload = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const files = normalizeFiles(req);
            if (files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No files uploaded. Make sure you selected an image (max 5MB).',
                });
            }
            const baseUrl = `${req.protocol}://${req.get('host') || ''}`.replace(/\/$/, '');
            const attachments = files.map((file) => {
                // Cloudinary: secure_url; disk: build URL from baseUrl + /uploads/ + filename
                let url = file.secure_url || file.url || file.path;
                if (url && typeof url === 'string' && !url.startsWith('http')) {
                    url = `${baseUrl}/uploads/${file.filename || file.originalname}`;
                }
                const imageUrl = url || '';
                return {
                    id: file.public_id || file.filename || file.originalname,
                    thumbnail: imageUrl,
                    original: imageUrl,
                    file_name: file.originalname,
                };
            });
            return (0, response_1.sendSuccess)(res, 'Files uploaded successfully', attachments);
        });
    }
}
exports.AttachmentController = AttachmentController;
