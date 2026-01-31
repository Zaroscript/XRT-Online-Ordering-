export interface SortableRepository {
  updateSortOrder(items: { id: string; order: number }[]): Promise<void>;
}

export class UpdateSortOrderUseCase {
  constructor(private repository: SortableRepository) {}

  async execute(items: { id: string; order: number }[]): Promise<void> {
    if (!items || items.length === 0) {
      return;
    }
    await this.repository.updateSortOrder(items);
  }
}
