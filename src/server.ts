import express from 'express';
import cors from 'cors';
// ★ { } を使った名前付きインポートで、ormconfig.tsと対応させる
import { AppDataSource } from './config/ormconfig'; 
import authRoutes from './routes/auth';
import itemRoutes from './routes/Items';
import userRoutes from './routes/userRoutes';
import likeRoutes from './routes/likeRoutes';
import orderRoutes from './routes/orderRoutes';

// AppDataSourceの初期化
AppDataSource.initialize()
    .then(() => {
        console.log("✅ Data Source has been initialized!");

        // Expressアプリのセットアップは .then() の中で行う
        const app = express();

        app.use(cors());
        app.use(express.json());

        // ルート設定
        app.use('/api/auth', authRoutes);
        app.use('/api/items', itemRoutes);
        app.use('/api/users', userRoutes);
        app.use('/api/items', likeRoutes);
        app.use('/api/orders', orderRoutes);

        const port = process.env.PORT || 3000;
        app.listen(port, () => {
            console.log(`🚀 Server is running on port ${port}`);
        });
    })
    .catch((err) => {
        // データベース接続に失敗した場合のエラー
        console.error("❌ Error during Data Source initialization:", err);
    });