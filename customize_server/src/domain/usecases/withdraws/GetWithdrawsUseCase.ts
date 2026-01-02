import { IWithdrawRepository, WithdrawFilters, PaginatedWithdraws } from '../../repositories/IWithdrawRepository';

export class GetWithdrawsUseCase {
  constructor(private withdrawRepository: IWithdrawRepository) {}

  async execute(filters: WithdrawFilters): Promise<PaginatedWithdraws> {
    return this.withdrawRepository.findAll(filters);
  }
}

