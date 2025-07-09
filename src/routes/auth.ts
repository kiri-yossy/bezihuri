// /src/routes/auth.ts (修正版)

import { Router, RequestHandler } from "express"; // ★ RequestHandler をインポート
import { register, login, verifyEmail } from "../controllers/authController";

const router = Router();

// POST /api/auth/register - ユーザー登録
router.post("/register", register as RequestHandler);

// POST /api/auth/login - ユーザーログイン
router.post("/login", login as RequestHandler);

// POST /api/auth/verify-email - メール認証
router.post("/verify-email", verifyEmail as RequestHandler);

export default router;