import { S3Client, PutObjectCommand, ObjectCannedACL } from "@aws-sdk/client-s3";
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

const s3Client = new S3Client({
    region: process.env.S3_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    }
});

export const uploadToS3 = async (fileBuffer: Buffer, fileName: string, mimeType?: string): Promise<string> => {
    console.log(`[DEBUG] uploadToS3: Uploading ${fileName} (MIME: ${mimeType}) - START`); // ★ログS1
    const uniqueFileName = `${Date.now()}-${fileName.replace(/\s+/g, '_')}`;

    const params = {
        Bucket: process.env.S3_BUCKET,
        Key: uniqueFileName,
        Body: fileBuffer,
        ContentType: mimeType || 'application/octet-stream',
    };

    try {
        console.log('[DEBUG] uploadToS3: Sending PutObjectCommand...'); // ★ログS2
        await s3Client.send(new PutObjectCommand(params));
        const objectUrl = `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com/${uniqueFileName}`;
        console.log(`[DEBUG] uploadToS3: Successfully uploaded ${fileName} to ${objectUrl} - END_SUCCESS`); // ★ログS3
        return objectUrl;
    } catch (error) {
        console.error("[DEBUG] uploadToS3: Error during S3 upload:", error); // ★ログS4
        // エラーを再スローして、呼び出し元（itemController）のcatchで処理できるようにする
        throw new Error(`S3へのファイルアップロードに失敗しました: ${fileName}. Original error: ${(error as Error).message}`);
    }
};