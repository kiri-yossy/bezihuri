// /src/controllers/commentController.ts

import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/ormconfig';
import { Comment } from '../entity/Comment';
import { Item } from '../entity/Item';
import { User } from '../entity/User';
import { AuthRequest } from '../middleware/auth';

// 特定の商品のコメント一覧を取得
export const getComments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const itemId = parseInt(req.params.itemId, 10);
        if (isNaN(itemId)) {
            res.status(400).json({ message: "無効な商品IDです。" });
            return;
        }

        const commentRepository = AppDataSource.getRepository(Comment);
        const comments = await commentRepository.find({
            where: { item: { id: itemId } },
            relations: ["user"], // コメントしたユーザーの情報も取得
            order: { createdAt: "ASC" }, // 古い順に表示
        });

        // パスワードなど不要な情報は除外して返す
        const sanitizedComments = comments.map(comment => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...userWithoutPassword } = comment.user;
            return { ...comment, user: userWithoutPassword };
        });

        res.json(sanitizedComments);
    } catch (err) {
        next(err);
    }
};

// 商品にコメントを投稿
export const postComment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const itemId = parseInt(req.params.itemId, 10);
        const { text } = req.body;
        const currentUser = req.user as User;

        if (isNaN(itemId)) {
            res.status(400).json({ message: "無効な商品IDです。" });
            return;
        }
        if (!text || text.trim() === '') {
            res.status(400).json({ message: "コメント本文を入力してください。" });
            return;
        }

        const itemRepository = AppDataSource.getRepository(Item);
        const item = await itemRepository.findOneBy({ id: itemId });
        if (!item) {
            res.status(404).json({ message: "対象の商品が見つかりません。" });
            return;
        }

        const commentRepository = AppDataSource.getRepository(Comment);
        const newComment = new Comment();
        newComment.text = text;
        newComment.item = item;
        newComment.user = currentUser;

        await commentRepository.save(newComment);

        // 保存したコメントにユーザー情報を付加して返す
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } = newComment.user;
        const responseComment = { ...newComment, user: userWithoutPassword };

        res.status(201).json(responseComment);
    } catch (err) {
        next(err);
    }
};