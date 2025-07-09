// /src/routes/commentRoutes.ts

import { Router, RequestHandler } from "express";
import { authMiddleware } from "../middleware/auth";
import { getComments, postComment } from "../controllers/commentController";

const router = Router();

// GET /api/items/:itemId/comments - 特定商品のコメント一覧取得
router.get("/:itemId/comments", getComments as RequestHandler);

// POST /api/items/:itemId/comments - 商品にコメントする (認証必須)
router.post("/:itemId/comments", authMiddleware as RequestHandler, postComment as RequestHandler);

export default router;