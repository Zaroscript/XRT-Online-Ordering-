import { IWithdrawRepository } from '../../repositories/IWithdrawRepository';
import { Withdraw } from '../../entities/Withdraw';
import { NotFoundError } from '../../../shared/errors/AppError';

export class GetWithdrawUseCase {
  constructor(private withdrawRepository: IWithdrawRepository) {}

  async execute(id: string): Promise<Withdraw> {
    const withdraw = await this.withdrawRepository.findById(id);
    if (!withdraw) {
      throw new NotFoundError('Withdraw not found');
    }
    return withdraw;
  }
}

