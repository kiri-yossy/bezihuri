import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/ormconfig';
import { User } from '../entity/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret';

// ExpressのRequest型を拡張して、userプロパティを持てるようにする
export interface AuthRequest extends Request {
    user?: User; // userプロパティをオプショナルで追加
}

// ★ ログイン必須の認証ミドルウェア (既存のもの)
export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: '認証トークンが必要です。' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOneBy({ id: decoded.userId });

        if (!user) {
            return res.status(401).json({ message: '無効なトークンです。ユーザーが見つかりません。' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({ message: '認証に失敗しました。無効なトークンです。' });
    }
};

// ★★★ ログイン状態を「任意」でチェックする新しいミドルウェアを追加 ★★★
export const softAuthMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    // トークンが存在し、正しい形式の場合のみユーザー情報を設定しようと試みる
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOneBy({ id: decoded.userId });

            if (user) {
                req.user = user; // ユーザー情報が見つかればセットする
            }
        } catch (error) {
            // トークンが無効でもエラーにはせず、単にreq.userを設定しないだけ
            console.log('Soft auth: Invalid token found, proceeding as guest.');
        }
    }

    // トークンの有無や有効性に関わらず、必ず次の処理に進む
    next();
};