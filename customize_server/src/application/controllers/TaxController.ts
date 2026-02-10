import { Request, Response } from 'express';
import { sendSuccess } from '../../shared/utils/response';
import { asyncHandler } from '../../shared/utils/asyncHandler';

export class TaxController {
  // Get all taxes
  index = asyncHandler(async (req: Request, res: Response) => {
    // Mock data
    const taxes = [
      {
        id: '1',
        name: 'Sales Tax',
        rate: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    return sendSuccess(res, 'Taxes retrieved successfully', taxes);
  });
}
