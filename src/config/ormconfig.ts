import { DataSource } from "typeorm";
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: true,
    
    // ★★★ この部分を修正 ★★★
    // 本番環境ではコンパイル後のJavaScriptファイルを、
    // 開発環境ではTypeScriptファイルを読み込むように設定
    entities: [
        process.env.NODE_ENV === 'production'
            ? 'dist/entity/**/*.js'
            : 'src/entity/**/*.ts'
    ],
    // ★★★★★★★★★★★★★★★★

    migrations: [],
    subscribers: [],
});