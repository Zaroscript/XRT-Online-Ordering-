import {
  ImportSession,
  CreateImportSessionDTO,
  UpdateImportSessionDTO,
} from '../entities/ImportSession';

export interface IImportSessionRepository {
  create(data: CreateImportSessionDTO): Promise<ImportSession>;
  findById(id: string, user_id?: string): Promise<ImportSession | null>;
  findByUser(user_id: string, business_id?: string): Promise<ImportSession[]>;
  /** All sessions, optionally scoped by business (e.g. super admin list). */
  findAll(business_id?: string): Promise<ImportSession[]>;
  update(id: string, user_id: string, data: UpdateImportSessionDTO): Promise<ImportSession>;
  delete(id: string, user_id: string): Promise<void>;
  deleteAll(user_id: string, business_id?: string): Promise<void>;
  deleteExpired(): Promise<number>;
}
