import { Request, Response } from 'express';
import { sendSuccess } from '../../shared/utils/response';
import { asyncHandler } from '../../shared/utils/asyncHandler';

export class ShippingController {
  // Get all shippings
  index = asyncHandler(async (req: Request, res: Response) => {
    // Mock data
    const shippings = [
      {
        id: '1',
        name: 'Free Shipping',
        amount: 0,
        is_global: true,
        type: 'fixed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Standard Shipping',
        amount: 10,
        is_global: true,
        type: 'fixed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    return sendSuccess(res, 'Shippings retrieved successfully', shippings);
  });
}
