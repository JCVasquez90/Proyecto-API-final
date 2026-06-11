import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { v4 as uuidv4 } from 'uuid';

export const uploadService = {
  uploadReceipt: async (file: File): Promise<string> => {
    // Leer variables de entorno
    const endpoint = process.env.R2_ENDPOINT;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucketName = process.env.R2_BUCKET_NAME || 'cashi-receipts';
    const publicUrl = process.env.R2_PUBLIC_URL;

    // Validar que todas las variables existen
    if (!endpoint || !accessKeyId || !secretAccessKey || !publicUrl) {
      console.error('Faltan variables de entorno de R2:');
      console.error('R2_ENDPOINT:', endpoint ? 'OK' : 'FALTA');
      console.error('R2_ACCESS_KEY_ID:', accessKeyId ? 'OK' : 'FALTA');
      console.error('R2_SECRET_ACCESS_KEY:', secretAccessKey ? 'OK' : 'FALTA');
      console.error('R2_PUBLIC_URL:', publicUrl ? 'OK' : 'FALTA');
      throw new Error('Configuración de R2 incompleta');
    }

    // Crear cliente S3
    const s3Client = new S3Client({
      region: 'auto',
      endpoint: endpoint,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
      forcePathStyle: true,
    });

    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `receipts/${uuidv4()}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: bucketName,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      },
    });

    await upload.done();

    return `${publicUrl}/${fileName}`;
  }
};