"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetItemUseCase = void 0;
class GetItemUseCase {
    constructor(itemRepository) {
        this.itemRepository = itemRepository;
    }
    async execute(id, business_id) {
        return await this.itemRepository.findById(id, business_id);
    }
}
exports.GetItemUseCase = GetItemUseCase;
