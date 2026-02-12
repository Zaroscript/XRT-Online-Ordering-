"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AttachmentController_1 = require("../controllers/AttachmentController");
const upload_1 = require("../middlewares/upload");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const attachmentController = new AttachmentController_1.AttachmentController();
const UPLOAD_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes for Cloudinary / slow connections
/** Set request/response timeout so we return 504 if upload hangs (e.g. Cloudinary very slow). */
function uploadTimeout(req, res, next) {
    req.setTimeout(UPLOAD_TIMEOUT_MS, () => {
        if (!res.headersSent) {
            res.status(504).json({
                success: false,
                message: 'Upload timed out after 5 minutes. Try a smaller image or set ATTACHMENT_STORAGE=disk in the server .env to use local storage.',
            });
        }
    });
    res.setTimeout(UPLOAD_TIMEOUT_MS, () => {
        if (!res.headersSent) {
            res.status(504).json({
                success: false,
                message: 'Upload timed out.',
            });
        }
    });
    next();
}
// Use any() to allow dynamic field names (e.g. 'icon', 'image', 'attachment[]') from client
// uploadAttachment uses Cloudinary or disk storage so we get real URLs for hero slides etc.
router.post('/', auth_1.requireAuth, uploadTimeout, (req, res, next) => {
    upload_1.uploadAttachment.any()(req, res, (err) => {
        if (err) {
            console.error('Multer Upload Error:', err);
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'File too large. Maximum size is 5MB.',
                    error: 'LIMIT_FILE_SIZE',
                });
            }
            return res.status(400).json({
                success: false,
                message: err.message || 'Error uploading file',
                error: err.name || 'UploadError',
            });
        }
        next();
    });
}, attachmentController.upload);
exports.default = router;
