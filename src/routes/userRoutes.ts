import { Router, RequestHandler } from "express"; // ★ RequestHandler をインポート
import { authMiddleware } from "../middleware/auth";
import { getMyItems , updateMyProfile, getMyProfile, getMyPurchases } from "../controllers/userController";

const router = Router();

// ★★★ GET /api/users/me - ログイン中のユーザーのプロフィール情報を取得 ★★★
router.get("/me", authMiddleware as RequestHandler, getMyProfile as RequestHandler);

// GET /api/users/me/items - ログイン中のユーザーが出品した商品一覧を取得
// ★★★ authMiddleware と getMyItems を RequestHandlerとしてキャスト ★★★
router.get("/me/items", authMiddleware as RequestHandler, getMyItems as RequestHandler);

// ★★★ PUT /api/users/me - ログイン中のユーザーのプロフィールを更新 ★★★
router.put("/me", authMiddleware as RequestHandler, updateMyProfile as RequestHandler);

// ★★★ GET /api/users/me/purchases - ログイン中のユーザーが購入した商品一覧を取得 ★★★
router.get("/me/purchases", authMiddleware as RequestHandler, getMyPurchases as RequestHandler);


export default router;