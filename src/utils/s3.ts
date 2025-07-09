import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

// プロキシ設定を削除し、シンプルなS3Clientの作成に戻します
const s3Client = new S3Client({
    region: process.env.S3_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    }
});

export const uploadToS3 = async (fileBuffer: Buffer, fileName: string, mimeType?: string): Promise<string> => {
    const uniqueFileName = `${Date.now()}-${fileName.replace(/\s+/g, '_')}`;

    const params = {
        Bucket: process.env.S3_BUCKET,
        Key: uniqueFileName,
        Body: fileBuffer,
        ContentType: mimeType || 'application/octet-stream',
        // ACLはバケットポリシーで対応するため、この行は削除したままにします
    };

    try {
        await s3Client.send(new PutObjectCommand(params));
        const objectUrl = `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com/${uniqueFileName}`;
        console.log(`Successfully uploaded ${fileName} to ${objectUrl}`);
        return objectUrl;
    } catch (error) {
        console.error("Error uploading to S3:", error);
        throw new Error(`S3へのファイルアップロードに失敗しました: ${fileName}`);
    }
};