import fs from 'fs';
import path from 'path';

export interface StoredFile {
  key: string;
  url: string;
  size: number;
  mimeType: string;
  originalName: string;
  filename: string;
}

class DiskStorageAdapter {
  private uploadDir: string;
  private publicBasePath: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.publicBasePath = '/uploads';
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadBuffer(buffer: Buffer, originalName: string, mimeType: string): Promise<StoredFile> {
    const uniqueName = `${Date.now()}_${Math.random().toString(36).slice(2)}_${sanitizeFilename(originalName)}`;
    const filePath = path.join(this.uploadDir, uniqueName);
    await fs.promises.writeFile(filePath, buffer);

    const stats = await fs.promises.stat(filePath);
    return {
      key: uniqueName,
      url: `${this.publicBasePath}/${uniqueName}`,
      size: stats.size,
      mimeType,
      originalName,
      filename: uniqueName,
    };
  }

  async deleteByKey(key: string): Promise<void> {
    const filePath = path.join(this.uploadDir, key);
    try {
      await fs.promises.unlink(filePath);
    } catch {
      // ignore if not found
    }
  }
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

class StorageService {
  private disk: DiskStorageAdapter;

  constructor() {
    this.disk = new DiskStorageAdapter();
  }

  async uploadMulterFile(file: Express.Multer.File): Promise<StoredFile> {
    return this.disk.uploadBuffer(file.buffer, file.originalname, file.mimetype);
  }

  async deleteByKey(key: string): Promise<void> {
    return this.disk.deleteByKey(key);
  }
}

const storageService = new StorageService();
export default storageService;