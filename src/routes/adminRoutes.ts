// /src/routes/adminRoutes.ts

import { Router, RequestHandler } from "express";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleware } from "../middleware/adminMiddleware";
import { 
    getAllUsers, 
    deleteUser,
    getAllItemsForAdmin,
    deleteItemForAdmin
} from "../controllers/adminController";

const router = Router();

// ★★★ すべてのルートに authMiddleware と adminMiddleware を適用 ★★★
// これにより、まずログインしているかを確認し、次に管理者であるかを確認します。

// ユーザー管理
router.get("/users", authMiddleware as RequestHandler, adminMiddleware, getAllUsers as RequestHandler);
router.delete("/users/:userId", authMiddleware as RequestHandler, adminMiddleware, deleteUser as RequestHandler);

// 商品管理
router.get("/items", authMiddleware as RequestHandler, adminMiddleware, getAllItemsForAdmin as RequestHandler);
router.delete("/items/:itemId", authMiddleware as RequestHandler, adminMiddleware, deleteItemForAdmin as RequestHandler);

export default router;