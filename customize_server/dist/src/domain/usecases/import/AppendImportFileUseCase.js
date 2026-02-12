"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppendImportFileUseCase = void 0;
const ImportValidationService_1 = require("../../../shared/services/ImportValidationService");
const csvParser_1 = require("../../../shared/utils/csvParser");
const AppError_1 = require("../../../shared/errors/AppError");
class AppendImportFileUseCase {
    constructor(importSessionRepository) {
        this.importSessionRepository = importSessionRepository;
    }
    async execute(sessionId, file, user_id, entity_type) {
        const session = await this.importSessionRepository.findById(sessionId, user_id);
        if (!session) {
            throw new AppError_1.AppError('Import session not found', 404);
        }
        // Parse new file
        const { data: newData, files: newFiles } = await csvParser_1.CSVParser.parseUpload(file, entity_type);
        // Merge data
        const mergedData = {
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
        const validation = ImportValidationService_1.ImportValidationService.validate(mergedData, session.business_id, uniqueFiles.join(', '));
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
exports.AppendImportFileUseCase = AppendImportFileUseCase;
