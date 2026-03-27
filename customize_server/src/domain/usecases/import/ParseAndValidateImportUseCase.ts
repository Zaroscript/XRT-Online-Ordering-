import { IImportSessionRepository } from '../../repositories/IImportSessionRepository';
import { IKitchenSectionRepository } from '../../repositories/IKitchenSectionRepository';
import { ImportSession, ParsedImportData } from '../../entities/ImportSession';
import { ImportValidationService } from '../../../shared/services/ImportValidationService';
import { CSVParser } from '../../../shared/utils/csvParser';
import { ValidationError } from '../../../shared/errors/AppError';
import {
  sanitizeImportValidationErrors,
  sanitizeImportValidationWarnings,
} from '../../../shared/utils/importValidationPersistence';

export class ParseAndValidateImportUseCase {
  constructor(
    private importSessionRepository: IImportSessionRepository,
    private kitchenSectionRepository: IKitchenSectionRepository
  ) {}

  async execute(
    file: Express.Multer.File,
    user_id: string,
    business_id: string,
    entity_type?: 'categories' | 'items' | 'sizes' | 'modifierGroups' | 'modifiers' | null
  ): Promise<ImportSession> {
    let data: ParsedImportData;
    let files: string[];

    try {
      const result = await CSVParser.parseUpload(file, entity_type);
      data = result.data;
      files = result.files;
    } catch (err: any) {
      const message = err?.message || 'Could not read file. Use a valid CSV or ZIP.';
      throw new ValidationError(message);
    }

    const existingSections = await this.kitchenSectionRepository.findAll({ business_id });
    const existingSectionNames = new Set(existingSections.map((ks) => ks.name.toLowerCase()));

    const validation = ImportValidationService.validate(
      data,
      business_id,
      files[0] || 'import.csv',
      existingSectionNames
    );

    const fileFallback = files[0] || 'import.csv';
    const session = await this.importSessionRepository.create({
      user_id,
      business_id,
      parsedData: data,
      validationErrors: sanitizeImportValidationErrors(validation.errors, fileFallback),
      validationWarnings: sanitizeImportValidationWarnings(validation.warnings, fileFallback),
      originalFiles: files,
    });

    const status = validation.errors.length > 0 ? 'draft' : 'validated';
    return await this.importSessionRepository.update(session.id, user_id, { status });
  }
}
