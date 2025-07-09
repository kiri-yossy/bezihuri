import { Router, RequestHandler } from "express";
import { authMiddleware } from "../middleware/auth";
import { 
    createReservationRequest, 
    approveReservation, 
    rejectReservation,
    completeReservation,
    getReservationRequests
} from "../controllers/reservationController";

const router = Router();

// ユーザーが商品を予約リクエストする
router.post("/items/:itemId/reserve", authMiddleware as RequestHandler, createReservationRequest as RequestHandler);

// 出品者が予約を承認する
router.put("/reservations/:reservationId/approve", authMiddleware as RequestHandler, approveReservation as RequestHandler);

// 出品者が予約を拒否する
router.put("/reservations/:reservationId/reject", authMiddleware as RequestHandler, rejectReservation as RequestHandler);

// 出品者が取引を完了させる
router.put("/reservations/:reservationId/complete", authMiddleware as RequestHandler, completeReservation as RequestHandler);

// 出品者に届いた予約リクエスト一覧を取得
router.get("/reservations/requests", authMiddleware as RequestHandler, getReservationRequests as RequestHandler);

export default router;