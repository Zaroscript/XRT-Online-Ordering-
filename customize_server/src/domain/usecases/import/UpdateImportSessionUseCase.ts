import { IImportSessionRepository } from '../../repositories/IImportSessionRepository';
import { ImportSession, UpdateImportSessionDTO } from '../../entities/ImportSession';
import { ImportValidationService } from '../../../shared/services/ImportValidationService';
import { NotFoundError, ValidationError } from '../../../shared/errors/AppError';
import {
  sanitizeImportValidationErrors,
  sanitizeImportValidationWarnings,
} from '../../../shared/utils/importValidationPersistence';

export class UpdateImportSessionUseCase {
  constructor(private importSessionRepository: IImportSessionRepository) { }

  async execute(
    sessionId: string,
    user_id: string,
    data: UpdateImportSessionDTO,
    bypassUserScope = false
  ): Promise<ImportSession> {
    const session = await this.importSessionRepository.findById(
      sessionId,
      bypassUserScope ? undefined : user_id
    );
    if (!session) {
      throw new Error('Import session not found');
    }
    const ownerId = session.user_id;

    // If parsedData is being updated, re-validate
    if (data.parsedData) {
      const parsedData = data.parsedData as any;
      if (typeof parsedData !== 'object' || parsedData === null) {
        throw new ValidationError('Invalid parsedData: must be an object');
      }
      let validation;
      try {
        validation = ImportValidationService.validate(
          parsedData,
          session.business_id,
          (session.originalFiles && session.originalFiles[0]) || 'import.csv'
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Import validation failed';
        throw new ValidationError(msg);
      }
      const fileFallback =
        (session.originalFiles && session.originalFiles[0]) || 'import.csv';
      data.validationErrors = sanitizeImportValidationErrors(
        validation.errors,
        fileFallback
      );
      data.validationWarnings = sanitizeImportValidationWarnings(
        validation.warnings,
        fileFallback
      );
      
      // Update status based on validation
      if (validation.errors.length > 0) {
        data.status = 'draft';
      } else {
        data.status = 'validated';
      }
    }

    return await this.importSessionRepository.update(sessionId, ownerId, data);
  }
}
