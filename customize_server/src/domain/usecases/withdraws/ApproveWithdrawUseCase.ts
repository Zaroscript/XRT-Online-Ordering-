import { IWithdrawRepository } from '../../repositories/IWithdrawRepository';
import { Withdraw, ApproveWithdrawDTO } from '../../entities/Withdraw';
import { NotFoundError, ValidationError } from '../../../shared/errors/AppError';

export class ApproveWithdrawUseCase {
  constructor(private withdrawRepository: IWithdrawRepository) {}

  async execute(id: string, approveData: ApproveWithdrawDTO, approvedBy: string): Promise<Withdraw> {
    const withdraw = await this.withdrawRepository.findById(id);
    if (!withdraw) {
      throw new NotFoundError('Withdraw not found');
    }

    if (withdraw.status !== 'pending') {
      throw new ValidationError('Only pending withdraws can be approved or rejected');
    }

    return this.withdrawRepository.update(id, {
      status: approveData.status,
      note: approveData.note,
    });
  }
}

