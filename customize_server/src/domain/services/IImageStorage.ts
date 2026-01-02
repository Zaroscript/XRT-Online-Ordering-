export interface ImageUploadResult {
  url: string;
  public_id: string;
  secure_url: string;
}

export interface IImageStorage {
  uploadImage(file: Express.Multer.File, folder?: string): Promise<ImageUploadResult>;
  deleteImage(public_id: string): Promise<void>;
}

