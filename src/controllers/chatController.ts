// /src/controllers/chatController.ts

import { Response, NextFunction } from 'express';
import { AppDataSource } from '../config/ormconfig';
import { Conversation } from '../entity/Conversation';
import { Message } from '../entity/Message';
import { User } from '../entity/User';
import { AuthRequest } from '../middleware/auth';
import { In } from 'typeorm';

// 自分の会話一覧を取得
export const getMyConversations = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const currentUser = req.user as User;
        const conversationRepo = AppDataSource.getRepository(Conversation);

        const conversations = await conversationRepo.find({
            where: {
                participants: { id: currentUser.id }
            },
            relations: ["participants", "reservation", "reservation.item", "messages"],
            order: { updatedAt: "DESC" }
        });

        res.json(conversations);
    } catch (err) {
        next(err);
    }
};

// 特定の会話のメッセージ一覧を取得
export const getMessages = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const conversationId = parseInt(req.params.conversationId, 10);
        const currentUser = req.user as User;
        
        // ユーザーがこの会話の参加者であるか確認（セキュリティ）
        const conversationRepo = AppDataSource.getRepository(Conversation);
        const conversation = await conversationRepo.findOne({
            where: { id: conversationId, participants: { id: currentUser.id } },
        });

        if (!conversation) {
            res.status(403).json({ message: "この会話にアクセスする権限がありません。" });
            return;
        }

        const messageRepo = AppDataSource.getRepository(Message);
        const messages = await messageRepo.find({
            where: { conversation: { id: conversationId } },
            relations: ["sender"],
            order: { createdAt: "ASC" }
        });

        res.json(messages);

    } catch (err) {
        next(err);
    }
};

// 新しいメッセージを送信
export const postMessage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const conversationId = parseInt(req.params.conversationId, 10);
        const { text } = req.body;
        const currentUser = req.user as User;

        if (!text || text.trim() === '') {
            res.status(400).json({ message: "メッセージ本文を入力してください。" });
            return;
        }

        const conversationRepo = AppDataSource.getRepository(Conversation);
        const conversation = await conversationRepo.findOne({
            where: { id: conversationId, participants: { id: currentUser.id } },
        });

        if (!conversation) {
            res.status(403).json({ message: "この会話にメッセージを送信する権限がありません。" });
            return;
        }

        const messageRepo = AppDataSource.getRepository(Message);
        const newMessage = new Message();
        newMessage.text = text;
        newMessage.sender = currentUser;
        newMessage.conversation = conversation;

        const savedMessage = await messageRepo.save(newMessage);
        
        // 会話のupdatedAtを更新して、一覧で一番上に表示されるようにする
        conversation.updatedAt = new Date();
        await conversationRepo.save(conversation);

        res.status(201).json(savedMessage);
    } catch (err) {
        next(err);
    }
};