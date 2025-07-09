// /src/routes/followRoutes.ts

import { Router, RequestHandler } from "express";
import { authMiddleware } from "../middleware/auth";
import { followUser, unfollowUser } from "../controllers/followController";

const router = Router();

// POST /api/users/:userId/follow - ユーザーをフォローする
router.post("/users/:userId/follow", authMiddleware as RequestHandler, followUser as RequestHandler);

// DELETE /api/users/:userId/follow - ユーザーのフォローを解除する
router.delete("/users/:userId/follow", authMiddleware as RequestHandler, unfollowUser as RequestHandler);

export default router;