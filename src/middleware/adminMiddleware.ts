// /src/middleware/adminMiddleware.ts

import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth'; // 既存のAuthRequestをインポート
import { UserRole } from '../entity/User'; // UserRole enumをインポート

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    // authMiddlewareによってreq.userが設定されている前提
    const user = req.user;

    // ユーザーが存在し、かつ役割が'admin'であるかチェック
    if (user && user.role === UserRole.ADMIN) {
        next(); // 管理者なら次の処理へ進む
    } else {
        // 管理者でなければ、アクセス拒否エラーを返す
        res.status(403).json({ message: "アクセス権がありません。管理者権限が必要です。" });
    }
};