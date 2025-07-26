import { DataSource } from "typeorm";
import * as dotenv from 'dotenv';

dotenv.config();

// 本番環境(Render)ではDATABASE_URLを、ローカル開発環境では個別の変数を参照します
const isProduction = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource(
    isProduction ? {
        // --- 本番環境用の設定 ---
        type: "postgres",
        url: process.env.DATABASE_URL, // Renderが提供する接続URLを直接使用
        ssl: {
            rejectUnauthorized: false // RenderのPostgresに必要
        },
        entities: ["dist/entity/**/*.js"],
        synchronize: true, // 本番ではマイグレーションを推奨しますが、演習なのでtrueのまま
        logging: true,
    } : {
        // --- ローカル開発環境用の設定 ---
        type: "postgres",
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        ssl: false,
        entities: ["src/entity/**/*.ts"],
        synchronize: true,
        logging: true,
    }
);