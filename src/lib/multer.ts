import multer from 'multer';

// Use memory storage; we'll stream to Cloudinary
export const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

export default upload;