import { IImportSessionRepository } from '../../repositories/IImportSessionRepository';
import { ImportSession, UpdateImportSessionDTO } from '../../entities/ImportSession';
import { ImportValidationService } from '../../../shared/services/ImportValidationService';

export class UpdateImportSessionUseCase {
  constructor(private importSessionRepository: IImportSessionRepository) { }

  async execute(
    sessionId: string,
    user_id: string,
    data: UpdateImportSessionDTO
  ): Promise<ImportSession> {
    const session = await this.importSessionRepository.findById(sessionId, user_id);
    if (!session) {
      throw new Error('Import session not found');
    }

    // If parsedData is being updated, re-validate
    if (data.parsedData) {
      const parsedData = data.parsedData as any;
      if (typeof parsedData !== 'object' || parsedData === null) {
        throw new Error('Invalid parsedData: must be an object');
      }
      const validation = ImportValidationService.validate(
        parsedData,
        session.business_id,
        (session.originalFiles && session.originalFiles[0]) || 'import.csv'
      );
      data.validationErrors = validation.errors;
      data.validationWarnings = validation.warnings;
      
      // Update status based on validation
      if (validation.errors.length > 0) {
        data.status = 'draft';
      } else {
        data.status = 'validated';
      }
    }

    return await this.importSessionRepository.update(sessionId, user_id, data);
  }
}
