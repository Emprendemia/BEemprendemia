import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import dotenv from 'dotenv';

dotenv.config();



const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!
});

router.post('/', upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No se envió ninguna imagen' });

    try {
        const streamUpload = (reqFile: Express.Multer.File): Promise<any> => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'courses' },
                    (error, result) => {
                        if (result) resolve(result);
                        else reject(error);
                    }
                );
                streamifier.createReadStream(reqFile.buffer).pipe(stream);
            });
        };

        const result = await streamUpload(req.file);
        return res.status(200).json({ imageUrl: result.secure_url });
    } catch (err: any) {
        console.error('🛑 Error al subir imagen a Cloudinary:', err.message || err);
        return res.status(500).json({ error: 'Error al subir imagen a Cloudinary', detail: err.message || err });
    }
});

export default router;
