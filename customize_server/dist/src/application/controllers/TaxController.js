"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxController = void 0;
const response_1 = require("../../shared/utils/response");
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
class TaxController {
    constructor() {
        // Get all taxes
        this.index = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
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
            return (0, response_1.sendSuccess)(res, 'Taxes retrieved successfully', taxes);
        });
    }
}
exports.TaxController = TaxController;
