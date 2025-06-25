import { Router, RequestHandler } from "express";
import { authMiddleware, softAuthMiddleware } from "../middleware/auth"; // ★ softAuthMiddleware をインポート
import { upload } from "../middleware/upload";
import {
    getAllItems,
    getItemById,
    createItem,
    updateItem,
    deleteItem,
    searchItems,
    getItemsByCategory
} from "../controllers/itemControllers";

const router = Router();

// ★★★ 認証が「任意」のGETルートに softAuthMiddleware を適用 ★★★
router.get("/search", softAuthMiddleware as RequestHandler, searchItems as RequestHandler);
router.get("/category/:categoryName", softAuthMiddleware as RequestHandler, getItemsByCategory as RequestHandler);
router.get("/", softAuthMiddleware as RequestHandler, getAllItems as RequestHandler);
router.get("/:id", softAuthMiddleware as RequestHandler, getItemById as RequestHandler);

// ★★★ 認証が「必須」のルートには authMiddleware を適用 ★★★
router.post("/", authMiddleware as RequestHandler, upload.array("images", 5), createItem as RequestHandler);
router.put("/:id", authMiddleware as RequestHandler, upload.array("images", 5), updateItem as RequestHandler);
router.delete("/:id", authMiddleware as RequestHandler, deleteItem as RequestHandler);

export default router;