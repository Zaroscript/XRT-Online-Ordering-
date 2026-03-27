import { IImportSessionRepository } from '../../repositories/IImportSessionRepository';
import { ImportSession } from '../../entities/ImportSession';

export class ListImportSessionsUseCase {
  constructor(private importSessionRepository: IImportSessionRepository) { }

  /**
   * @param listAllSessions — super admin: all sessions (optional business filter); else only this user's.
   */
  async execute(
    user_id: string,
    business_id?: string,
    listAllSessions = false
  ): Promise<ImportSession[]> {
    if (listAllSessions) {
      return await this.importSessionRepository.findAll(business_id);
    }
    return await this.importSessionRepository.findByUser(user_id, business_id);
  }
}
