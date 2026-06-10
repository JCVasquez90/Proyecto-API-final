import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { v4 as uuidv4 } from 'uuid';

// Configurar cliente S3 compatible con R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,        // ej: https://xxx.r2.cloudflarestorage.com
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'cashi-receipts';
const PUBLIC_URL = process.env.R2_PUBLIC_URL; // ej: https://pub-xxx.r2.dev

export const uploadService = {
  uploadReceipt: async (file: File): Promise<string> => {
    const ext = file.name.split('.').pop();
    const fileName = `receipts/${uuidv4()}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      },
    });

    await upload.done();

    // Construir URL pública
    return `${PUBLIC_URL}/${fileName}`;
  }
};