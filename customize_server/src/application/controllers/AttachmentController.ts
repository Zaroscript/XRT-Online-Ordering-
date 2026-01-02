import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess } from '../../shared/utils/response';

export class AttachmentController {
    upload = asyncHandler(async (req: Request, res: Response) => {
        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded',
            });
        }

        const attachments = files.map((file: any) => ({
            id: file.filename || file.public_id,
            thumbnail: file.path || file.secure_url,
            original: file.path || file.secure_url,
        }));

        return sendSuccess(res, 'Files uploaded successfully', attachments);
    });
}
