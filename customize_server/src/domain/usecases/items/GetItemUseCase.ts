import { IItemRepository } from '../../repositories/IItemRepository';
import { Item } from '../../entities/Item';

export class GetItemUseCase {
  constructor(private itemRepository: IItemRepository) {}

  async execute(id: string): Promise<Item | null> {
    return await this.itemRepository.findById(id);
  }
}
