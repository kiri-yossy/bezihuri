// /src/routes/likeRoutes.ts

import { Router, RequestHandler } from "express";
import { authMiddleware } from "../middleware/auth";
import { addLike, removeLike } from "../controllers/likeController";

const router = Router();

// POST /api/items/:itemId/like - 商品にいいねする
router.post("/:itemId/like", authMiddleware as RequestHandler, addLike as RequestHandler);

// DELETE /api/items/:itemId/like - 商品のいいねを取り消す
router.delete("/:itemId/like", authMiddleware as RequestHandler, removeLike as RequestHandler);

export default router;