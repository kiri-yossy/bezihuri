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
    
    entities: [
        process.env.NODE_ENV === 'production'
            ? 'dist/entity/**/*.js'
            : 'src/entity/**/*.ts'
    ],

    // ★★★ このSSL設定を追加 ★★★
    // 本番環境（NODE_ENVが'production'）の場合のみ、SSL接続を有効にする
    ssl: process.env.NODE_ENV === 'production' 
        ? { rejectUnauthorized: false } 
        : false,
    // ★★★★★★★★★★★★★★★★★★

    migrations: [],
    subscribers: [],
});