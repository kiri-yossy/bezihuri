// /src/routes/chatRoutes.ts

import { Router, RequestHandler } from "express";
import { authMiddleware } from "../middleware/auth";
import { 
    getMyConversations,
    getMessages,
    postMessage
} from "../controllers/chatController";

const router = Router();

// 自分の会話一覧を取得
router.get("/", authMiddleware as RequestHandler, getMyConversations as RequestHandler);

// 特定の会話のメッセージ一覧を取得
router.get("/:conversationId/messages", authMiddleware as RequestHandler, getMessages as RequestHandler);

// 特定の会話に新しいメッセージを送信
router.post("/:conversationId/messages", authMiddleware as RequestHandler, postMessage as RequestHandler);

export default router;