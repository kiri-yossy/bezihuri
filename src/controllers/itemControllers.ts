import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/ormconfig';
import { Item, ItemStatus } from '../entity/Item';
import { User } from '../entity/User';
import { Reservation } from '../entity/Reservation';
import { Like } from '../entity/Like';
import { Follow } from '../entity/Follow';
import { Review } from '../entity/Review';
import { Conversation } from '../entity/Conversation';
import { AuthRequest } from '../middleware/auth';
import { ILike, In } from "typeorm";
import * as wanakana from 'wanakana';
import { uploadToS3 } from '../utils/s3';

// ★★★ getAllItems 関数を修正 ★★★
export const getAllItems = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const filter = req.query.filter as string; // ★ フィルター用のクエリパラメータを取得
        const skip = (page - 1) * limit;
        const currentUserId = req.user?.id;

        const itemRepository = AppDataSource.getRepository(Item);

        // ★ フィルターに応じてwhere句を動的に構築
        const whereCondition: any = {};
        if (filter === 'available') {
            whereCondition.status = ItemStatus.AVAILABLE;
        } else if (filter === 'reserved') {
            whereCondition.status = In([ItemStatus.RESERVED, ItemStatus.PENDING_RESERVATION]);
        } else { // 'all' または指定なしの場合
            whereCondition.status = In([ItemStatus.AVAILABLE, ItemStatus.RESERVED, ItemStatus.PENDING_RESERVATION]);
        }

        const [items, totalItems] = await itemRepository.findAndCount({
            where: whereCondition,
            order: { createdAt: "DESC" },
            relations: ["seller", "likes", "likes.user"],
            skip: skip,
            take: limit,
        });

        const itemsWithLikeData = items.map(item => {
            const likeCount = item.likes.length;
            const isLikedByCurrentUser = currentUserId 
                ? item.likes.some(like => like.user.id === currentUserId) 
                : false;
            const { likes, ...itemWithoutLikes } = item;
            return { ...itemWithoutLikes, likeCount, isLikedByCurrentUser };
        });

        const totalPages = Math.ceil(totalItems / limit);

        res.json({
            items: itemsWithLikeData,
            totalItems,
            totalPages,
            currentPage: page,
        });

    } catch (err) {
        console.error('Error in getAllItems:', err);
        next(err);
    }
};

export const getItemById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const itemId = parseInt(req.params.id, 10);
        if (isNaN(itemId)) {
            res.status(400).json({ message: "無効な商品IDです。" });
            return;
        }
        const itemRepository = AppDataSource.getRepository(Item);
        const item = await itemRepository.findOne({
            where: { id: itemId },
            relations: ["seller", "likes", "likes.user"],
        });
        if (!item) {
            res.status(404).json({ message: "商品が見つかりません" });
            return;
        }
        const currentUserId = req.user?.id;
        const likeCount = item.likes.length;
        const isLikedByCurrentUser = currentUserId 
            ? item.likes.some(like => like.user.id === currentUserId) 
            : false;
        const { likes, ...itemWithoutLikes } = item;
        res.json({ ...itemWithoutLikes, likeCount, isLikedByCurrentUser });
    } catch (err) {
        console.error('Error in getItemById:', err);
        next(err);
    }
};

export const createItem = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { title, description, price, status, category } = req.body;
        const seller = req.user as User;
        const files = req.files as Express.Multer.File[] | undefined;
        const imageUrls: string[] = [];
        if (!seller) {
            res.status(401).json({ message: "認証されていません" });
            return;
        }
        if (!title || !description || price === undefined) {
            res.status(400).json({ message: "タイトル、説明、価格は必須です。" });
            return;
        }
        const numericPrice = Number(price);
        if (isNaN(numericPrice) || numericPrice < 0) {
            res.status(400).json({ message: "価格は0以上の数値を入力してください。" });
            return;
        }
        if (files && files.length > 0) {
            for (const file of files) {
                const url = await uploadToS3(file.buffer, file.originalname, file.mimetype);
                imageUrls.push(url);
            }
        }
        const itemRepository = AppDataSource.getRepository(Item);
        const newItem = itemRepository.create({
            title,
            description,
            price: numericPrice,
            status: status || ItemStatus.AVAILABLE,
            category: category,
            seller: seller,
            imageUrls,
        });
        const savedItem = await itemRepository.save(newItem);
        res.status(201).json(savedItem);
    } catch (err) {
        console.error('Error in createItem:', err);
        next(err);
    }
};

export const updateItem = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const itemId = parseInt(req.params.id, 10);
        if (isNaN(itemId)) {
            res.status(400).json({ message: "無効な商品IDです。" });
            return;
        }
        const { title, description, price, status, category } = req.body;
        const files = req.files as Express.Multer.File[] | undefined;
        const currentUser = req.user as User;
        if (!currentUser) {
            res.status(401).json({ message: "認証されていません。" });
            return;
        }
        const itemRepository = AppDataSource.getRepository(Item);
        const itemToUpdate = await itemRepository.findOne({
            where: { id: itemId },
            relations: ["seller"],
        });
        if (!itemToUpdate) {
            res.status(404).json({ message: "更新対象の商品が見つかりません。" });
            return;
        }
        if (itemToUpdate.seller.id !== currentUser.id) {
            res.status(403).json({ message: "この商品を編集する権限がありません。" });
            return;
        }
        if (title !== undefined) itemToUpdate.title = title;
        if (description !== undefined) itemToUpdate.description = description;
        if (category !== undefined) itemToUpdate.category = category;
        if (price !== undefined) {
            const numericPrice = Number(price);
            if (!isNaN(numericPrice) && numericPrice >= 0) {
                itemToUpdate.price = numericPrice;
            }
        }
        if (status !== undefined) itemToUpdate.status = status as ItemStatus;
        if (files && files.length > 0) {
            const newImageUrls: string[] = [];
            for (const file of files) {
                const url = await uploadToS3(file.buffer, file.originalname, file.mimetype);
                newImageUrls.push(url);
            }
            itemToUpdate.imageUrls = newImageUrls;
        }
        const updatedItem = await itemRepository.save(itemToUpdate);
        res.json(updatedItem);
    } catch (error) {
        console.error('Error in updateItem:', error);
        next(error);
    }
};

export const deleteItem = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const itemId = parseInt(req.params.id, 10);
        if (isNaN(itemId)) {
            res.status(400).json({ message: "無効な商品IDです。" });
            return;
        }
        const currentUser = req.user as User;
        if (!currentUser) {
            res.status(401).json({ message: "認証されていません。" });
            return;
        }
        const itemRepository = AppDataSource.getRepository(Item);
        const itemToDelete = await itemRepository.findOne({
            where: { id: itemId },
            relations: ["seller"],
        });
        if (!itemToDelete) {
            res.status(404).json({ message: "削除対象の商品が見つかりません。" });
            return;
        }
        if (itemToDelete.seller.id !== currentUser.id) {
            res.status(403).json({ message: "この商品を削除する権限がありません。" });
            return;
        }
        await itemRepository.remove(itemToDelete);
        res.status(204).send();
    } catch (error) {
        console.error('Error in deleteItem:', error);
        next(error);
    }
};

export const searchItems = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const query = req.query.q as string;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 9;
        const skip = (page - 1) * limit;
        const currentUserId = req.user?.id;

        if (!query || query.trim() === '') {
            res.json({ items: [], totalItems: 0, totalPages: 0, currentPage: 1 });
            return;
        }

        const normalizedQuery = wanakana.toHiragana(query);
        const itemRepository = AppDataSource.getRepository(Item);

        const [items, totalItems] = await itemRepository.findAndCount({
            where: { 
                searchText: ILike(`%${normalizedQuery}%`),
                status: ItemStatus.AVAILABLE
            },
            relations: ["seller", "likes", "likes.user"],
            order: { createdAt: "DESC" },
            skip: skip,
            take: limit,
        });

        const itemsWithLikeData = items.map(item => {
            const likeCount = item.likes.length;
            const isLikedByCurrentUser = currentUserId 
                ? item.likes.some(like => like.user.id === currentUserId) 
                : false;
            const { likes, ...restOfItem } = item;
            return { ...restOfItem, likeCount, isLikedByCurrentUser };
        });

        const totalPages = Math.ceil(totalItems / limit);

        res.json({
            items: itemsWithLikeData,
            totalItems,
            totalPages,
            currentPage: page,
        });
    } catch (err) {
        console.error('Error in searchItems:', err);
        next(err);
    }
};

// ★★★ getItemsByCategory 関数を修正 ★★★
export const getItemsByCategory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const category = req.params.categoryName;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;
        const currentUserId = req.user?.id; // ★ req.user を使えるように

        const itemRepository = AppDataSource.getRepository(Item);
        const [items, totalItems] = await itemRepository.findAndCount({
            where: { 
                category: category,
                status: ItemStatus.AVAILABLE
            },
            order: { createdAt: "DESC" },
            relations: ["seller", "likes", "likes.user"], // ★ いいね情報も取得
            skip: skip,
            take: limit,
        });

        const itemsWithLikeData = items.map(item => {
            const likeCount = item.likes.length;
            const isLikedByCurrentUser = currentUserId 
                ? item.likes.some(like => like.user.id === currentUserId) 
                : false;
            const { likes, ...restOfItem } = item;
            return { ...restOfItem, likeCount, isLikedByCurrentUser };
        });

        const totalPages = Math.ceil(totalItems / limit);

        res.json({
            items: itemsWithLikeData,
            totalItems,
            totalPages,
            currentPage: page,
        });
    } catch (err) {
        console.error('Error in getItemsByCategory:', err);
        next(err);
    }
};