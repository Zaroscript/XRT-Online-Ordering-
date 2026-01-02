import { IWithdrawRepository } from '../../repositories/IWithdrawRepository';

export class DeleteWithdrawUseCase {
  constructor(private withdrawRepository: IWithdrawRepository) {}

  async execute(id: string): Promise<void> {
    await this.withdrawRepository.delete(id);
  }
}

