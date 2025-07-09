// /src/controllers/adminController.ts

import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/ormconfig';
import { User } from '../entity/User';
import { Item } from '../entity/Item';

// 全ユーザーの一覧を取得
export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userRepository = AppDataSource.getRepository(User);
        const users = await userRepository.find({
            select: ["id", "username", "email", "role", "isVerified", "createdAt"], // パスワードなどは除外
        });
        res.json(users);
    } catch (err) {
        next(err);
    }
};

// 特定のユーザーを削除
export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = parseInt(req.params.userId, 10);
        if (isNaN(userId)) {
            res.status(400).json({ message: "無効なユーザーIDです。" });
            return;
        }

        const userRepository = AppDataSource.getRepository(User);
        const userToDelete = await userRepository.findOneBy({ id: userId });

        if (!userToDelete) {
            res.status(404).json({ message: "ユーザーが見つかりません。" });
            return;
        }

        await userRepository.remove(userToDelete);
        res.status(204).send();

    } catch (err) {
        next(err);
    }
};

// 全商品の一覧を取得
export const getAllItemsForAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const itemRepository = AppDataSource.getRepository(Item);
        const items = await itemRepository.find({
            relations: ["seller"],
            order: { createdAt: "DESC" },
        });
        res.json(items);
    } catch (err) {
        next(err);
    }
};

// 特定の商品を削除
export const deleteItemForAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const itemId = parseInt(req.params.itemId, 10);
        if (isNaN(itemId)) {
            res.status(400).json({ message: "無効な商品IDです。" });
            return;
        }

        const itemRepository = AppDataSource.getRepository(Item);
        const itemToDelete = await itemRepository.findOneBy({ id: itemId });

        if (!itemToDelete) {
            res.status(404).json({ message: "商品が見つかりません。" });
            return;
        }

        // TODO: (任意) S3上の関連画像も削除する処理

        await itemRepository.remove(itemToDelete);
        res.status(204).send();
        
    } catch (err) {
        next(err);
    }
};