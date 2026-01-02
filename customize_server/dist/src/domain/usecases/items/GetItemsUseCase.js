"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetItemsUseCase = void 0;
class GetItemsUseCase {
    constructor(itemRepository) {
        this.itemRepository = itemRepository;
    }
    async execute(filters) {
        return await this.itemRepository.findAll(filters);
    }
}
exports.GetItemsUseCase = GetItemsUseCase;
