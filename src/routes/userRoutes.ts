import { Router, RequestHandler } from "express";
import { authMiddleware, softAuthMiddleware } from "../middleware/auth";
import { 
    getMyItems, 
    updateMyProfile, 
    getMyProfile, 
    getMyReservations,
    getMyLikedItems,
    getUserProfile
} from "../controllers/userController";

const router = Router();

// ★★★ ログイン中のユーザー専用ルート (具体的なパスを先に) ★★★
router.get("/me", authMiddleware as RequestHandler, getMyProfile as RequestHandler);
router.put("/me", authMiddleware as RequestHandler, updateMyProfile as RequestHandler);
router.get("/me/items", authMiddleware as RequestHandler, getMyItems as RequestHandler);
router.get("/me/reservations", authMiddleware as RequestHandler, getMyReservations as RequestHandler);
router.get("/me/likes", authMiddleware as RequestHandler, getMyLikedItems as RequestHandler);

// ★★★ 他のユーザーの公開プロフィール取得ルート (動的なパスを後に) ★★★
router.get("/:userId", softAuthMiddleware as RequestHandler, getUserProfile as RequestHandler);

export default router;