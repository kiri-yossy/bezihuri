// /src/config/ormconfig.ts

import { DataSource } from "typeorm";
import * as dotenv from 'dotenv';

// .envファイルを読み込む
dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER, // あなたの.envファイルに合わせています
    password: process.env.DB_PASS, // あなたの.envファイルに合わせています
    database: process.env.DB_NAME, // あなたの.envファイルに合わせています
    synchronize: true, // 開発中はtrue
    logging: true,     // 実行されるSQLをコンソールに表示
    entities: ["src/entity/**/*.ts"], // ★エンティティファイルをこのパターンで検出
    migrations: [],
    subscribers: [],
});