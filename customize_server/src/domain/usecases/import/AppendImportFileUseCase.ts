import { IImportSessionRepository } from '../../repositories/IImportSessionRepository';
import { ImportSession, ParsedImportData } from '../../entities/ImportSession';
import { ImportValidationService } from '../../../shared/services/ImportValidationService';
import { CSVParser } from '../../../shared/utils/csvParser';
import { AppError } from '../../../shared/errors/AppError';

export class AppendImportFileUseCase {
  constructor(private importSessionRepository: IImportSessionRepository) {}

  async execute(
    sessionId: string,
    file: Express.Multer.File,
    user_id: string,
    entity_type?: 'categories' | 'items' | 'sizes' | 'modifierGroups' | 'modifiers' | null
  ): Promise<ImportSession> {
    const session = await this.importSessionRepository.findById(sessionId, user_id);
    if (!session) {
      throw new AppError('Import session not found', 404);
    }

    // Parse new file
    const { data: newData, files: newFiles } = await CSVParser.parseUpload(file, entity_type);

    // Merge data
    const mergedData: ParsedImportData = {
      categories: [...(session.parsedData.categories || []), ...(newData.categories || [])],
      items: [...(session.parsedData.items || []), ...(newData.items || [])],
      itemSizes: [...(session.parsedData.itemSizes || []), ...(newData.itemSizes || [])],
      modifierGroups: [
        ...(session.parsedData.modifierGroups || []),
        ...(newData.modifierGroups || []),
      ],
      modifiers: [...(session.parsedData.modifiers || []), ...(newData.modifiers || [])],
      itemModifierOverrides: [
        ...(session.parsedData.itemModifierOverrides || []),
        ...(newData.itemModifierOverrides || []),
      ],
    };

    // Update file list
    const updatedFiles = [...(session.originalFiles || []), ...newFiles];
    const uniqueFiles = Array.from(new Set(updatedFiles));

    // Re-validate
    const validation = ImportValidationService.validate(
      mergedData,
      session.business_id,
      uniqueFiles.join(', ')
    );

    // Update Session
    const status = validation.errors.length > 0 ? 'draft' : 'validated';

    return await this.importSessionRepository.update(session.id, user_id, {
      status,
      parsedData: mergedData,
      validationErrors: validation.errors,
      validationWarnings: validation.warnings,
      originalFiles: uniqueFiles,
    });
  }
}
