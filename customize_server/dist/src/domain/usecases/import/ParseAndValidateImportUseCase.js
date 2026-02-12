"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParseAndValidateImportUseCase = void 0;
const ImportValidationService_1 = require("../../../shared/services/ImportValidationService");
const csvParser_1 = require("../../../shared/utils/csvParser");
const AppError_1 = require("../../../shared/errors/AppError");
class ParseAndValidateImportUseCase {
    constructor(importSessionRepository, kitchenSectionRepository) {
        this.importSessionRepository = importSessionRepository;
        this.kitchenSectionRepository = kitchenSectionRepository;
    }
    async execute(file, user_id, business_id, entity_type) {
        let data;
        let files;
        try {
            const result = await csvParser_1.CSVParser.parseUpload(file, entity_type);
            data = result.data;
            files = result.files;
        }
        catch (err) {
            const message = err?.message || 'Could not read file. Use a valid CSV or ZIP.';
            throw new AppError_1.ValidationError(message);
        }
        const existingSections = await this.kitchenSectionRepository.findAll({ business_id });
        const existingSectionNames = new Set(existingSections.map((ks) => ks.name.toLowerCase()));
        const validation = ImportValidationService_1.ImportValidationService.validate(data, business_id, files[0] || 'import.csv', existingSectionNames);
        const session = await this.importSessionRepository.create({
            user_id,
            business_id,
            parsedData: data,
            validationErrors: validation.errors,
            validationWarnings: validation.warnings,
            originalFiles: files,
        });
        const status = validation.errors.length > 0 ? 'draft' : 'validated';
        return await this.importSessionRepository.update(session.id, user_id, { status });
    }
}
exports.ParseAndValidateImportUseCase = ParseAndValidateImportUseCase;
