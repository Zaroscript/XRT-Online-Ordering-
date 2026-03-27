import { IImportSessionRepository } from '../../repositories/IImportSessionRepository';
import { ValidationError } from '../../../shared/errors/AppError';

export class DeleteImportSessionUseCase {
  constructor(private importSessionRepository: IImportSessionRepository) {}

  async execute(sessionId: string, user_id: string, bypassUserScope = false): Promise<void> {
    const session = await this.importSessionRepository.findById(
      sessionId,
      bypassUserScope ? undefined : user_id
    );
    if (!session) {
      throw new ValidationError('Import session not found');
    }

    await this.importSessionRepository.delete(sessionId, session.user_id);
  }
}
