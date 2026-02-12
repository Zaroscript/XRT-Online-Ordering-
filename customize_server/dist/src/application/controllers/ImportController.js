"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportController = void 0;
const response_1 = require("../../shared/utils/response");
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const AppError_1 = require("../../shared/errors/AppError");
const roles_1 = require("../../shared/constants/roles");
const ParseAndValidateImportUseCase_1 = require("../../domain/usecases/import/ParseAndValidateImportUseCase");
const UpdateImportSessionUseCase_1 = require("../../domain/usecases/import/UpdateImportSessionUseCase");
const FinalSaveImportUseCase_1 = require("../../domain/usecases/import/FinalSaveImportUseCase");
const GetImportSessionUseCase_1 = require("../../domain/usecases/import/GetImportSessionUseCase");
const ListImportSessionsUseCase_1 = require("../../domain/usecases/import/ListImportSessionsUseCase");
const DiscardImportSessionUseCase_1 = require("../../domain/usecases/import/DiscardImportSessionUseCase");
const DeleteImportSessionUseCase_1 = require("../../domain/usecases/import/DeleteImportSessionUseCase");
const RollbackImportUseCase_1 = require("../../domain/usecases/import/RollbackImportUseCase");
const ClearImportHistoryUseCase_1 = require("../../domain/usecases/import/ClearImportHistoryUseCase");
const AppendImportFileUseCase_1 = require("../../domain/usecases/import/AppendImportFileUseCase");
const ImportSessionRepository_1 = require("../../infrastructure/repositories/ImportSessionRepository");
const BusinessRepository_1 = require("../../infrastructure/repositories/BusinessRepository");
const KitchenSectionRepository_1 = require("../../infrastructure/repositories/KitchenSectionRepository");
const auditLogger_1 = require("../../shared/utils/auditLogger");
class ImportController {
    constructor() {
        this.parseAndValidate = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            // Super Admin only
            // Check for business_id from body, query, or user token
            let business_id = req.body.business_id || req.query.business_id || req.user?.business_id;
            // If still no business_id, use the single business (active or not) for import
            if (!business_id) {
                const defaultBusiness = await this.businessRepository.findOneForImport();
                if (defaultBusiness) {
                    business_id = defaultBusiness.business_id;
                }
            }
            if (!business_id) {
                throw new AppError_1.ValidationError('No business found. Create one first.');
            }
            if (!req.file) {
                throw new AppError_1.ValidationError('Please upload a CSV or ZIP file.');
            }
            // Optional: frontend can explicitly specify the entity type for this file
            const entity_type = req.body.entity_type || null;
            const session = await this.parseAndValidateUseCase.execute(req.file, req.user.id, business_id, entity_type);
            auditLogger_1.AuditLogger.logImport(auditLogger_1.AuditAction.IMPORT_PARSE, req.user.id, business_id, session.id, {
                files: session.originalFiles,
                errors: session.validationErrors.length,
                warnings: session.validationWarnings.length,
            });
            return (0, response_1.sendSuccess)(res, 'Import parsed and validated', session, 201);
        });
        this.appendFile = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            if (!req.file) {
                throw new AppError_1.ValidationError('Please upload a CSV or ZIP file.');
            }
            const entity_type = req.body.entity_type || null;
            const appendUseCase = new AppendImportFileUseCase_1.AppendImportFileUseCase(new ImportSessionRepository_1.ImportSessionRepository());
            const session = await appendUseCase.execute(id, req.file, req.user.id, entity_type);
            return (0, response_1.sendSuccess)(res, 'File appended successfully', session);
        });
        this.getSession = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            if (req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                return (0, response_1.sendError)(res, 'Only Super Admin can access import sessions', 403);
            }
            const { id } = req.params;
            const session = await this.getSessionUseCase.execute(id, req.user.id);
            if (!session) {
                return (0, response_1.sendError)(res, 'Import session not found', 404);
            }
            return (0, response_1.sendSuccess)(res, 'Import session retrieved', session);
        });
        this.listSessions = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            if (req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                return (0, response_1.sendError)(res, 'Only Super Admin can list import sessions', 403);
            }
            const business_id = req.query.business_id;
            const sessions = await this.listSessionsUseCase.execute(req.user.id, business_id);
            return (0, response_1.sendSuccess)(res, 'Import sessions retrieved', sessions);
        });
        this.updateSession = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            if (req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                return (0, response_1.sendError)(res, 'Only Super Admin can update import sessions', 403);
            }
            const { id } = req.params;
            const { parsedData, status } = req.body;
            const updateData = {};
            if (parsedData) {
                updateData.parsedData = parsedData;
            }
            if (status) {
                updateData.status = status;
            }
            const session = await this.updateSessionUseCase.execute(id, req.user.id, updateData);
            auditLogger_1.AuditLogger.logImport(auditLogger_1.AuditAction.IMPORT_SAVE_DRAFT, req.user.id, session.business_id, session.id, { status: session.status });
            return (0, response_1.sendSuccess)(res, 'Import session updated', session);
        });
        this.finalSave = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            if (req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                return (0, response_1.sendError)(res, 'Only Super Admin can save imports', 403);
            }
            const { id } = req.params;
            const session = await this.getSessionUseCase.execute(id, req.user.id);
            await this.finalSaveUseCase.execute(id, req.user.id);
            auditLogger_1.AuditLogger.logImport(auditLogger_1.AuditAction.IMPORT_FINAL_SAVE, req.user.id, session?.business_id || '', id, { items: session?.parsedData.items.length, itemSizes: session?.parsedData.itemSizes.length });
            return (0, response_1.sendSuccess)(res, 'Import saved to database successfully', null);
        });
        this.discardSession = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            if (req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                return (0, response_1.sendError)(res, 'Only Super Admin can discard import sessions', 403);
            }
            const { id } = req.params;
            const session = await this.getSessionUseCase.execute(id, req.user.id);
            await this.discardSessionUseCase.execute(id, req.user.id);
            auditLogger_1.AuditLogger.logImport(auditLogger_1.AuditAction.IMPORT_DISCARD, req.user.id, session?.business_id || '', id);
            return (0, response_1.sendSuccess)(res, 'Import session discarded', null);
        });
        this.deleteSession = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            if (req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                return (0, response_1.sendError)(res, 'Only Super Admin can delete import sessions', 403);
            }
            const { id } = req.params;
            await this.deleteSessionUseCase.execute(id, req.user.id);
            auditLogger_1.AuditLogger.logImport(auditLogger_1.AuditAction.IMPORT_DISCARD, req.user.id, '', id, { action: 'delete' });
            return (0, response_1.sendSuccess)(res, 'Import session deleted', null);
        });
        this.downloadErrors = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            if (req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                return (0, response_1.sendError)(res, 'Only Super Admin can download errors', 403);
            }
            const { id } = req.params;
            const session = await this.getSessionUseCase.execute(id, req.user.id);
            if (!session) {
                return (0, response_1.sendError)(res, 'Import session not found', 404);
            }
            // Convert errors to CSV
            const csvRows = [
                ['file', 'row', 'entity', 'field', 'message', 'value'].join(','),
                ...session.validationErrors.map((err) => [
                    `"${err.file}"`,
                    err.row,
                    `"${err.entity}"`,
                    `"${err.field}"`,
                    `"${err.message}"`,
                    `"${err.value || ''}"`,
                ].join(',')),
            ];
            const csvContent = csvRows.join('\n');
            auditLogger_1.AuditLogger.logImport(auditLogger_1.AuditAction.IMPORT_DOWNLOAD_ERRORS, req.user.id, session.business_id, id, { errorCount: session.validationErrors.length });
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="import-errors-${id}.csv"`);
            res.send(csvContent);
        });
        this.rollbackSession = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            if (req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                return (0, response_1.sendError)(res, 'Only Super Admin can rollback import sessions', 403);
            }
            const { id } = req.params;
            const rollbackUseCase = new RollbackImportUseCase_1.RollbackImportUseCase(new ImportSessionRepository_1.ImportSessionRepository());
            await rollbackUseCase.execute(id, req.user.id);
            // Fetch updated session
            const session = await this.getSessionUseCase.execute(id, req.user.id);
            auditLogger_1.AuditLogger.logImport(auditLogger_1.AuditAction.IMPORT_ROLLBACK, // Need to add this action to enum if strict
            req.user.id, session?.business_id || '', id);
            return (0, response_1.sendSuccess)(res, 'Import session rolled back successfully', null);
        });
        this.clearHistory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            if (req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                return (0, response_1.sendError)(res, 'Only Super Admin can clear import history', 403);
            }
            let business_id = req.body.business_id || req.query.business_id || req.user?.business_id;
            if (business_id === 'undefined')
                business_id = undefined;
            const clearHistoryUseCase = new ClearImportHistoryUseCase_1.ClearImportHistoryUseCase(new ImportSessionRepository_1.ImportSessionRepository());
            await clearHistoryUseCase.execute(req.user.id, business_id);
            auditLogger_1.AuditLogger.logImport(auditLogger_1.AuditAction.IMPORT_DISCARD, // Reusing discard or add new action?
            req.user.id, business_id || '', '', { action: 'clear_history' });
            return (0, response_1.sendSuccess)(res, 'Import history cleared successfully', null);
        });
        const importSessionRepository = new ImportSessionRepository_1.ImportSessionRepository();
        this.businessRepository = new BusinessRepository_1.BusinessRepository();
        const kitchenSectionRepository = new KitchenSectionRepository_1.KitchenSectionRepository();
        this.parseAndValidateUseCase = new ParseAndValidateImportUseCase_1.ParseAndValidateImportUseCase(importSessionRepository, kitchenSectionRepository);
        this.updateSessionUseCase = new UpdateImportSessionUseCase_1.UpdateImportSessionUseCase(importSessionRepository);
        this.finalSaveUseCase = new FinalSaveImportUseCase_1.FinalSaveImportUseCase(importSessionRepository);
        this.getSessionUseCase = new GetImportSessionUseCase_1.GetImportSessionUseCase(importSessionRepository);
        this.listSessionsUseCase = new ListImportSessionsUseCase_1.ListImportSessionsUseCase(importSessionRepository);
        this.listSessionsUseCase = new ListImportSessionsUseCase_1.ListImportSessionsUseCase(importSessionRepository);
        this.discardSessionUseCase = new DiscardImportSessionUseCase_1.DiscardImportSessionUseCase(importSessionRepository);
        this.deleteSessionUseCase = new DeleteImportSessionUseCase_1.DeleteImportSessionUseCase(importSessionRepository);
    }
}
exports.ImportController = ImportController;
