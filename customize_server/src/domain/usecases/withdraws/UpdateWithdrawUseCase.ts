import { IWithdrawRepository } from '../../repositories/IWithdrawRepository';
import { Withdraw, UpdateWithdrawDTO } from '../../entities/Withdraw';

export class UpdateWithdrawUseCase {
  constructor(private withdrawRepository: IWithdrawRepository) {}

  async execute(id: string, withdrawData: UpdateWithdrawDTO): Promise<Withdraw> {
    return this.withdrawRepository.update(id, withdrawData);
  }
}

