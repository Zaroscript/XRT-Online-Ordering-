import { IItemRepository, PaginatedItems } from '../../repositories/IItemRepository';
import { ItemFilters } from '../../entities/Item';

export class GetItemsUseCase {
    constructor(private itemRepository: IItemRepository) { }

    async execute(filters: ItemFilters): Promise<PaginatedItems> {
        return await this.itemRepository.findAll(filters);
    }
}
