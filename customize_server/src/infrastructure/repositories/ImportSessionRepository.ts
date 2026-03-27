import mongoose from 'mongoose';
import { NotFoundError, ValidationError } from '../../shared/errors/AppError';
import { IImportSessionRepository } from '../../domain/repositories/IImportSessionRepository';
import {
  ImportSession,
  CreateImportSessionDTO,
  UpdateImportSessionDTO,
} from '../../domain/entities/ImportSession';
import { ImportSessionModel, ImportSessionDocument } from '../database/models/ImportSessionModel';

export class ImportSessionRepository implements IImportSessionRepository {
  /** Plain JSON-safe object (avoids Mongoose subdoc cycles / non-JSON types in API responses). */
  private toDomain(document: ImportSessionDocument): ImportSession {
    const plain = document.toObject({
      versionKey: false,
      flattenMaps: true,
    });
    return {
      id: plain._id.toString(),
      user_id: plain.user_id,
      business_id: plain.business_id,
      status: plain.status,
      parsedData: plain.parsedData as any,
      validationErrors: (plain.validationErrors as any) || [],
      validationWarnings: (plain.validationWarnings as any) || [],
      originalFiles: plain.originalFiles || [],
      expires_at: plain.expires_at,
      created_at: plain.created_at,
      updated_at: plain.updated_at,
    };
  }

  async create(data: CreateImportSessionDTO): Promise<ImportSession> {
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + 7);

    try {
      const sessionDoc = new ImportSessionModel({
        ...data,
        expires_at,
      });
      await sessionDoc.save();
      return this.toDomain(sessionDoc);
    } catch (err: unknown) {
      if (err instanceof mongoose.Error.ValidationError) {
        const messages = Object.values(err.errors)
          .map((e) => e.message)
          .join('; ');
        throw new ValidationError(messages || err.message);
      }
      throw err;
    }
  }

  async findById(id: string, user_id?: string): Promise<ImportSession | null> {
    const query: any = { _id: id };
    if (user_id) {
      query.user_id = user_id;
    }
    const sessionDoc = await ImportSessionModel.findOne(query);
    return sessionDoc ? this.toDomain(sessionDoc) : null;
  }

  async findByUser(user_id: string, business_id?: string): Promise<ImportSession[]> {
    const query: any = { user_id };
    if (business_id) {
      query.business_id = business_id;
    }
    const sessionDocs = await ImportSessionModel.find(query).sort({ created_at: -1 });
    return sessionDocs.map((doc) => this.toDomain(doc));
  }

  async findAll(business_id?: string): Promise<ImportSession[]> {
    const query: Record<string, unknown> = {};
    if (business_id) {
      query.business_id = business_id;
    }
    const sessionDocs = await ImportSessionModel.find(query).sort({ created_at: -1 });
    return sessionDocs.map((doc) => this.toDomain(doc));
  }

  async update(id: string, user_id: string, data: UpdateImportSessionDTO): Promise<ImportSession> {
    try {
      const sessionDoc = await ImportSessionModel.findOneAndUpdate({ _id: id, user_id }, data, {
        new: true,
        runValidators: true,
      });

      if (!sessionDoc) {
        throw new NotFoundError('Import session');
      }

      return this.toDomain(sessionDoc);
    } catch (err: unknown) {
      if (err instanceof NotFoundError) throw err;
      if (err instanceof mongoose.Error.ValidationError) {
        const messages = Object.values(err.errors)
          .map((e) => e.message)
          .join('; ');
        throw new ValidationError(messages || err.message);
      }
      if (err instanceof mongoose.Error.CastError) {
        throw new NotFoundError('Import session');
      }
      throw err;
    }
  }

  async delete(id: string, user_id: string): Promise<void> {
    const result = await ImportSessionModel.findOneAndDelete({ _id: id, user_id });
    if (!result) {
      throw new NotFoundError('Import session');
    }
  }

  async deleteAll(user_id: string, business_id?: string): Promise<void> {
    const query: any = { user_id };
    if (business_id) {
      query.business_id = business_id;
    }
    await ImportSessionModel.deleteMany(query);
  }

  async deleteExpired(): Promise<number> {
    const result = await ImportSessionModel.deleteMany({
      expires_at: { $lt: new Date() },
    });
    return result.deletedCount || 0;
  }
}
