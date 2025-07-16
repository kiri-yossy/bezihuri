// /src/server.ts

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { AppDataSource } from './config/ormconfig';
import authRoutes from './routes/auth';
import itemRoutes from './routes/Items';
import userRoutes from './routes/userRoutes';
import likeRoutes from './routes/likeRoutes';
import reservationRoutes from './routes/reservationRoutes'; // orderRoutesから変更
import commentRoutes from './routes/commentRoutes';
import chatRoutes from './routes/chatRoutes';
import reviewRoutes from './routes/reviewRoutes';
import followRoutes from './routes/followRoutes';
import adminRoutes from './routes/adminRoutes';

// AppDataSourceの初期化
AppDataSource.initialize()
    .then(async () => {
        console.log("✅ Data Source has been initialized!");

        // メール機能の初期化
        // プロキシ環境でない場合は、これが原因の可能性は低いですが、念のためtry-catchで囲みます
        try {
        } catch (emailError) {
            console.error("❌ Failed to initialize email service. Continuing without it.", emailError);
        }

        const app = express();
        const corsOptions = {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173', // 環境変数からフロントエンドのURLを取得
            optionsSuccessStatus: 200
        };
        app.use(cors(corsOptions));
        app.use(express.json());

        // ヘルスチェック用ルート
        app.get("/", (req, res) => {
            res.send("VegiFuri API is running!");
        });

        // APIルート設定
        app.use('/api/auth', authRoutes);
        app.use('/api/items', itemRoutes);
        app.use('/api/users', userRoutes);
        app.use('/api/items', likeRoutes);
        app.use('/api', reservationRoutes);
        app.use('/api/items', commentRoutes);
        app.use('/api/conversations', chatRoutes);
        app.use('/api', reviewRoutes);
        app.use('/api', followRoutes);
        app.use('/api/admin', adminRoutes);

        // ★★★ グローバルなエラーハンドリングミドルウェアを追加 ★★★
        // これが全てのコントローラーのエラーを最終的にキャッチします
        app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
            console.error("🔥🔥🔥 Global Error Handler Caught:", err);
            res.status(500).json({
                message: "サーバー内部で予期せぬエラーが発生しました。",
                error: err.message, // 開発中はエラーメッセージを返す
            });
        });

        const port = process.env.PORT || 3000;
        app.listen(port, () => {
            console.log(`🚀 Server is running on port ${port}`);
        });
    })
    .catch((err) => {
        console.error("❌ Error during Data Source initialization:", err);
    });