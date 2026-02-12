"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShippingController = void 0;
const response_1 = require("../../shared/utils/response");
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
class ShippingController {
    constructor() {
        // Get all shippings
        this.index = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
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
            return (0, response_1.sendSuccess)(res, 'Shippings retrieved successfully', shippings);
        });
    }
}
exports.ShippingController = ShippingController;
