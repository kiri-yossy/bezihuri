// /src/routes/orderRoutes.ts

import { Router, RequestHandler } from "express";
import { authMiddleware } from "../middleware/auth";
import { createOrder } from "../controllers/orderController";

const router = Router();

// POST /api/orders - 商品を購入する
router.post("/", authMiddleware as RequestHandler, createOrder as RequestHandler);

export default router;