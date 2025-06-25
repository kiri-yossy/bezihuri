import { DataSource } from "typeorm";
import * as dotenv from 'dotenv';
import { User } from "../entity/User";
import { Item } from "../entity/Item";
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,      // ★ あなたの.envに合わせて DB_USER を使用
    password: process.env.DB_PASS,      // ★ あなたの.envに合わせて DB_PASS を使用
    database: process.env.DB_NAME,      // ★ あなたの.envに合わせて DB_NAME を使用
    synchronize: true,
    logging: true,
    entities: [__dirname + '/../entity/*.ts', __dirname + '/../entity/*.js'],
    migrations: [],
    subscribers: [],
});