import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { AppDataSource } from './config/ormconfig';
import { createServer } from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/auth';
import itemRoutes from './routes/Items';
import userRoutes from './routes/userRoutes';
import likeRoutes from './routes/likeRoutes';
import reservationRoutes from './routes/reservationRoutes';
import commentRoutes from './routes/commentRoutes';
import followRoutes from './routes/followRoutes';
import reviewRoutes from './routes/reviewRoutes';
import adminRoutes from './routes/adminRoutes';
import chatRoutes from './routes/chatRoutes'; // ★ chatRoutesをインポート

AppDataSource.initialize()
    .then(async () => {
        console.log("✅ Data Source has been initialized!");
        
        const app = express();
        const httpServer = createServer(app);
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

        const io = new Server(httpServer, {
            cors: { origin: frontendUrl, methods: ["GET", "POST"] }
        });

        io.on('connection', (socket) => {
            console.log(`🔌 New client connected: ${socket.id}`);
            socket.on('joinRoom', (conversationId) => {
                socket.join(conversationId);
                console.log(`Client ${socket.id} joined room ${conversationId}`);
            });
            socket.on('sendMessage', (data) => {
                socket.to(data.conversationId).emit('receiveMessage', data.message);
                console.log(`Message broadcasted in room ${data.conversationId}`);
            });
            socket.on('disconnect', () => {
                console.log(`🔌 Client disconnected: ${socket.id}`);
            });
        });

        app.use(cors({ origin: frontendUrl }));
        app.use(express.json());

        app.get("/", (req, res) => { res.send("VegiFuri API is running!"); });
        
        // APIルート設定
        app.use('/api/auth', authRoutes);
        app.use('/api/items', itemRoutes);
        app.use('/api/users', userRoutes);
        app.use('/api/items', likeRoutes);
        app.use('/api', reservationRoutes);
        app.use('/api', reviewRoutes);
        app.use('/api', followRoutes);
        app.use('/api/admin', adminRoutes);
        app.use('/api/items', commentRoutes);
        app.use('/api/conversations', chatRoutes); // ★★★ この行を追加 ★★★

        app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
            console.error("🔥🔥🔥 Global Error Handler Caught:", err);
            res.status(500).json({ message: "サーバー内部で予期せぬエラーが発生しました。", error: err.message });
        });

        const port = process.env.PORT || 3000;
        httpServer.listen(port, () => {
            console.log(`🚀 Server is running on port ${port}, and WebSocket is listening.`);
        });
    })
    .catch((err) => {
        console.error("❌ Error during Data Source initialization:", err);
    });