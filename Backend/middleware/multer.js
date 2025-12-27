import multer from "multer";
import path from "path";

// Multer setup - Store files in memory
const storage = multer.memoryStorage(); 

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error("Only JPEG, JPG, and PNG images are allowed"));
        }
    },
});

export default upload;
