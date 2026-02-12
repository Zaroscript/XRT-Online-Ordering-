import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { sendSuccess, sendError } from '../../shared/utils/response';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ValidationError } from '../../shared/errors/AppError';
import { UserRole } from '../../shared/constants/roles';
import { ParseAndValidateImportUseCase } from '../../domain/usecases/import/ParseAndValidateImportUseCase';
import { UpdateImportSessionUseCase } from '../../domain/usecases/import/UpdateImportSessionUseCase';
import { FinalSaveImportUseCase } from '../../domain/usecases/import/FinalSaveImportUseCase';
import { GetImportSessionUseCase } from '../../domain/usecases/import/GetImportSessionUseCase';
import { ListImportSessionsUseCase } from '../../domain/usecases/import/ListImportSessionsUseCase';
import { DiscardImportSessionUseCase } from '../../domain/usecases/import/DiscardImportSessionUseCase';
import { DeleteImportSessionUseCase } from '../../domain/usecases/import/DeleteImportSessionUseCase';
import { RollbackImportUseCase } from '../../domain/usecases/import/RollbackImportUseCase';
import { ClearImportHistoryUseCase } from '../../domain/usecases/import/ClearImportHistoryUseCase';
import { AppendImportFileUseCase } from '../../domain/usecases/import/AppendImportFileUseCase';
import { ImportSessionRepository } from '../../infrastructure/repositories/ImportSessionRepository';
import { BusinessRepository } from '../../infrastructure/repositories/BusinessRepository';
import { KitchenSectionRepository } from '../../infrastructure/repositories/KitchenSectionRepository';
import { ParsedImportData } from '../../domain/entities/ImportSession';
import { AuditLogger, AuditAction } from '../../shared/utils/auditLogger';

export class ImportController {
  private parseAndValidateUseCase: ParseAndValidateImportUseCase;
  private updateSessionUseCase: UpdateImportSessionUseCase;
  private finalSaveUseCase: FinalSaveImportUseCase;
  private getSessionUseCase: GetImportSessionUseCase;
  private listSessionsUseCase: ListImportSessionsUseCase;
  private discardSessionUseCase: DiscardImportSessionUseCase;
  private deleteSessionUseCase: DeleteImportSessionUseCase;
  private businessRepository: BusinessRepository;

  constructor() {
    const importSessionRepository = new ImportSessionRepository();
    this.businessRepository = new BusinessRepository();

    const kitchenSectionRepository = new KitchenSectionRepository();
    this.parseAndValidateUseCase = new ParseAndValidateImportUseCase(
      importSessionRepository,
      kitchenSectionRepository
    );
    this.updateSessionUseCase = new UpdateImportSessionUseCase(importSessionRepository);
    this.finalSaveUseCase = new FinalSaveImportUseCase(importSessionRepository);
    this.getSessionUseCase = new GetImportSessionUseCase(importSessionRepository);
    this.listSessionsUseCase = new ListImportSessionsUseCase(importSessionRepository);
    this.listSessionsUseCase = new ListImportSessionsUseCase(importSessionRepository);
    this.discardSessionUseCase = new DiscardImportSessionUseCase(importSessionRepository);
    this.deleteSessionUseCase = new DeleteImportSessionUseCase(importSessionRepository);
  }

  parseAndValidate = asyncHandler(async (req: AuthRequest, res: Response) => {
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
      throw new ValidationError('No business found. Create one first.');
    }

    if (!req.file) {
      throw new ValidationError('Please upload a CSV or ZIP file.');
    }

    // Optional: frontend can explicitly specify the entity type for this file
    const entity_type = req.body.entity_type || null;

    const session = await this.parseAndValidateUseCase.execute(
      req.file,
      req.user!.id,
      business_id,
      entity_type
    );

    AuditLogger.logImport(AuditAction.IMPORT_PARSE, req.user!.id, business_id, session.id, {
      files: session.originalFiles,
      errors: session.validationErrors.length,
      warnings: session.validationWarnings.length,
    });

    return sendSuccess(res, 'Import parsed and validated', session, 201);
  });

  appendFile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    if (!req.file) {
      throw new ValidationError('Please upload a CSV or ZIP file.');
    }

    const entity_type = req.body.entity_type || null;

    const appendUseCase = new AppendImportFileUseCase(new ImportSessionRepository());
    const session = await appendUseCase.execute(id, req.file, req.user!.id, entity_type);

    return sendSuccess(res, 'File appended successfully', session);
  });

  getSession = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== UserRole.SUPER_ADMIN) {
      return sendError(res, 'Only Super Admin can access import sessions', 403);
    }

    const { id } = req.params;
    const session = await this.getSessionUseCase.execute(id, req.user!.id);

    if (!session) {
      return sendError(res, 'Import session not found', 404);
    }

    return sendSuccess(res, 'Import session retrieved', session);
  });

  listSessions = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== UserRole.SUPER_ADMIN) {
      return sendError(res, 'Only Super Admin can list import sessions', 403);
    }

    const business_id = req.query.business_id as string | undefined;
    const sessions = await this.listSessionsUseCase.execute(req.user!.id, business_id);

    return sendSuccess(res, 'Import sessions retrieved', sessions);
  });

  updateSession = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== UserRole.SUPER_ADMIN) {
      return sendError(res, 'Only Super Admin can update import sessions', 403);
    }

    const { id } = req.params;
    const { parsedData, status } = req.body;

    const updateData: any = {};
    if (parsedData) {
      updateData.parsedData = parsedData as ParsedImportData;
    }
    if (status) {
      updateData.status = status;
    }

    const session = await this.updateSessionUseCase.execute(id, req.user!.id, updateData);

    AuditLogger.logImport(
      AuditAction.IMPORT_SAVE_DRAFT,
      req.user!.id,
      session.business_id,
      session.id,
      { status: session.status }
    );

    return sendSuccess(res, 'Import session updated', session);
  });

  finalSave = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== UserRole.SUPER_ADMIN) {
      return sendError(res, 'Only Super Admin can save imports', 403);
    }

    const { id } = req.params;
    const session = await this.getSessionUseCase.execute(id, req.user!.id);

    await this.finalSaveUseCase.execute(id, req.user!.id);

    AuditLogger.logImport(
      AuditAction.IMPORT_FINAL_SAVE,
      req.user!.id,
      session?.business_id || '',
      id,
      { items: session?.parsedData.items.length, itemSizes: session?.parsedData.itemSizes.length }
    );

    return sendSuccess(res, 'Import saved to database successfully', null);
  });

  discardSession = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== UserRole.SUPER_ADMIN) {
      return sendError(res, 'Only Super Admin can discard import sessions', 403);
    }

    const { id } = req.params;
    const session = await this.getSessionUseCase.execute(id, req.user!.id);

    await this.discardSessionUseCase.execute(id, req.user!.id);

    AuditLogger.logImport(AuditAction.IMPORT_DISCARD, req.user!.id, session?.business_id || '', id);

    return sendSuccess(res, 'Import session discarded', null);
  });

  deleteSession = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== UserRole.SUPER_ADMIN) {
      return sendError(res, 'Only Super Admin can delete import sessions', 403);
    }

    const { id } = req.params;
    await this.deleteSessionUseCase.execute(id, req.user!.id);

    AuditLogger.logImport(AuditAction.IMPORT_DISCARD, req.user!.id, '', id, { action: 'delete' });

    return sendSuccess(res, 'Import session deleted', null);
  });

  downloadErrors = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== UserRole.SUPER_ADMIN) {
      return sendError(res, 'Only Super Admin can download errors', 403);
    }

    const { id } = req.params;
    const session = await this.getSessionUseCase.execute(id, req.user!.id);

    if (!session) {
      return sendError(res, 'Import session not found', 404);
    }

    // Convert errors to CSV
    const csvRows = [
      ['file', 'row', 'entity', 'field', 'message', 'value'].join(','),
      ...session.validationErrors.map((err) =>
        [
          `"${err.file}"`,
          err.row,
          `"${err.entity}"`,
          `"${err.field}"`,
          `"${err.message}"`,
          `"${err.value || ''}"`,
        ].join(',')
      ),
    ];

    const csvContent = csvRows.join('\n');

    AuditLogger.logImport(
      AuditAction.IMPORT_DOWNLOAD_ERRORS,
      req.user!.id,
      session.business_id,
      id,
      { errorCount: session.validationErrors.length }
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="import-errors-${id}.csv"`);
    res.send(csvContent);
  });

  rollbackSession = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== UserRole.SUPER_ADMIN) {
      return sendError(res, 'Only Super Admin can rollback import sessions', 403);
    }

    const { id } = req.params;
    const rollbackUseCase = new RollbackImportUseCase(new ImportSessionRepository());

    await rollbackUseCase.execute(id, req.user!.id);

    // Fetch updated session
    const session = await this.getSessionUseCase.execute(id, req.user!.id);

    AuditLogger.logImport(
      AuditAction.IMPORT_ROLLBACK, // Need to add this action to enum if strict
      req.user!.id,
      session?.business_id || '',
      id
    );

    return sendSuccess(res, 'Import session rolled back successfully', null);
  });

  clearHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== UserRole.SUPER_ADMIN) {
      return sendError(res, 'Only Super Admin can clear import history', 403);
    }

    let business_id = req.body.business_id || req.query.business_id || req.user?.business_id;
    if (business_id === 'undefined') business_id = undefined;

    const clearHistoryUseCase = new ClearImportHistoryUseCase(new ImportSessionRepository());
    await clearHistoryUseCase.execute(req.user!.id, business_id);

    AuditLogger.logImport(
      AuditAction.IMPORT_DISCARD, // Reusing discard or add new action?
      req.user!.id,
      business_id || '',
      '',
      { action: 'clear_history' }
    );

    return sendSuccess(res, 'Import history cleared successfully', null);
  });
}
