import multer from 'multer';

const memoryStorage = multer.memoryStorage();

export const upload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB default limit
    files: 1,
  },
});

export default upload;