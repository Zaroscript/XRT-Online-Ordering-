import { IWithdrawRepository } from '../../repositories/IWithdrawRepository';
import { Withdraw, CreateWithdrawDTO } from '../../entities/Withdraw';
import { ValidationError } from '../../../shared/errors/AppError';

export class CreateWithdrawUseCase {
  constructor(private withdrawRepository: IWithdrawRepository) {}

  async execute(withdrawData: CreateWithdrawDTO, createdBy: string): Promise<Withdraw> {
    if (withdrawData.amount <= 0) {
      throw new ValidationError('Amount must be greater than 0');
    }

    return this.withdrawRepository.create(withdrawData, createdBy);
  }
}

