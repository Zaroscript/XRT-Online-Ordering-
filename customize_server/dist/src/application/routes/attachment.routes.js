"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AttachmentController_1 = require("../controllers/AttachmentController");
const upload_1 = require("../middlewares/upload");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const attachmentController = new AttachmentController_1.AttachmentController();
// Use any() to be flexible with field names, or use array('attachment[]') to match frontend
router.post('/', auth_1.requireAuth, upload_1.uploadImage.array('attachment[]'), attachmentController.upload);
exports.default = router;
