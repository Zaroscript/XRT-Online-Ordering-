"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttachmentController = void 0;
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const response_1 = require("../../shared/utils/response");
class AttachmentController {
    constructor() {
        this.upload = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const files = req.files;
            if (!files || files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No files uploaded',
                });
            }
            const attachments = files.map((file) => ({
                id: file.filename || file.public_id,
                thumbnail: file.path || file.secure_url,
                original: file.path || file.secure_url,
            }));
            return (0, response_1.sendSuccess)(res, 'Files uploaded successfully', attachments);
        });
    }
}
exports.AttachmentController = AttachmentController;
