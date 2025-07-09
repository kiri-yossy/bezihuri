import { Router, RequestHandler } from "express";
import { authMiddleware } from "../middleware/auth";
import { createReview, getUserReviews } from "../controllers/reviewController";

const router = Router();

// 特定ユーザーの評価一覧を取得
router.get("/users/:userId/reviews", getUserReviews as RequestHandler);

// 取引に対して評価を投稿
router.post("/reservations/:reservationId/review", authMiddleware as RequestHandler, createReview as RequestHandler);

export default router;