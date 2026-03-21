import { IImportSessionRepository } from '../../repositories/IImportSessionRepository';
import { ImportSession } from '../../entities/ImportSession';

export class GetImportSessionUseCase {
  constructor(private importSessionRepository: IImportSessionRepository) { }

  /**
   * @param bypassUserScope — super admin may open any session; otherwise restricted to own sessions.
   */
  async execute(
    sessionId: string,
    user_id: string,
    bypassUserScope = false
  ): Promise<ImportSession | null> {
    return await this.importSessionRepository.findById(
      sessionId,
      bypassUserScope ? undefined : user_id
    );
  }
}
