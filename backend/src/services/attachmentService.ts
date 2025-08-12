import prisma from '@/lib/prisma';
import storageService, { StoredFile } from '@/services/storageService';

class AttachmentService {
  async addAttachmentToItem(itemId: string, userId: string, file: Express.Multer.File) {
    const stored: StoredFile = await storageService.uploadMulterFile(file);

    const attachment = await prisma.attachment.create({
      data: {
        filename: stored.filename,
        originalName: stored.originalName,
        mimeType: stored.mimeType,
        size: stored.size,
        url: stored.url,
        uploadedBy: userId,
        itemId,
      },
    });

    return attachment;
  }

  async getItemAttachments(itemId: string) {
    return prisma.attachment.findMany({
      where: { itemId },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async deleteAttachment(attachmentId: string) {
    const attachment = await prisma.attachment.findUnique({ where: { id: attachmentId } });
    if (!attachment) return null;

    await prisma.attachment.delete({ where: { id: attachmentId } });

    // Best-effort delete from storage
    const key = attachment.filename;
    await storageService.deleteByKey(key).catch(() => {});

    return attachment;
  }
}

const attachmentService = new AttachmentService();
export default attachmentService;