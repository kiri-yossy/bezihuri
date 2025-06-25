import { Router } from "express";
import { register, login } from "../controllers/authController"; // ★コントローラーから関数をインポート

const router = Router();

// POST /api/auth/register - ユーザー登録
router.post("/register", register); // ★インポートしたregister関数を渡す

// POST /api/auth/login - ユーザーログイン
router.post("/login", login);     // ★インポートしたlogin関数を渡す

export default router;