import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/ormconfig';
import { Item, ItemStatus } from '../entity/Item';
import { User } from '../entity/User';
import { AuthRequest } from '../middleware/auth';
import { uploadToS3 } from '../utils/s3';
import { ILike } from "typeorm";
import * as wanakana from 'wanakana'; // wanakanaをインポート

// 全件取得
export const getAllItems = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const itemRepository = AppDataSource.getRepository(Item);

        const [items, totalItems] = await itemRepository.findAndCount({
            order: { createdAt: "DESC" },
            relations: ["seller", "likes", "likes.user"], // ★ "likes"と"likes.user"を追加
            skip: skip,
            take: limit,
        });

        // ログイン中のユーザーIDを取得 (トークンがあれば)
        const currentUserId = req.user?.id;

        // 各商品にいいね数と、ログインユーザーがいいね済みかどうかの情報を追加
        const itemsWithLikeData = items.map(item => {
            const likeCount = item.likes.length;
            const isLikedByCurrentUser = currentUserId 
                ? item.likes.some(like => like.user.id === currentUserId) 
                : false;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { likes, ...itemWithoutLikes } = item; // レスポンスから不要なlikes配列を削除
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


// 単一取得
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
            relations: ["seller", "likes", "likes.user"], // ★ "likes"と"likes.user"を追加
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
            
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { likes, ...itemWithoutLikes } = item;

        res.json({ ...itemWithoutLikes, likeCount, isLikedByCurrentUser });

    } catch (err) {
        console.error('Error in getItemById:', err);
        next(err);
    }
};

// 新規出品
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

// 商品情報更新
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

// 商品削除
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

// ★★★ 商品検索 (ひらがな・カタカナ対応版) ★★★
export const searchItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const query = req.query.q as string;

        if (!query || query.trim() === '') {
            res.json([]);
            return;
        }

        // 検索キーワードをひらがなに変換
        const normalizedQuery = wanakana.toHiragana(query);

        const itemRepository = AppDataSource.getRepository(Item);

        // searchTextカラムを検索
        const items = await itemRepository.find({
            where: { 
                searchText: ILike(`%${normalizedQuery}%`)
            },
            relations: ["seller"],
            order: { createdAt: "DESC" },
        });

        res.json(items);

    } catch (err) {
        console.error('Error in searchItems:', err);
        next(err);
    }
};

// ★★★ カテゴリー別商品一覧取得API ★★★
export const getItemsByCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const category = req.params.categoryName; // URLからカテゴリー名を取得
        
        // ページネーションも追加
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const itemRepository = AppDataSource.getRepository(Item);
        const [items, totalItems] = await itemRepository.findAndCount({
            where: { category: category },
            order: { createdAt: "DESC" },
            relations: ["seller"],
            skip: skip,
            take: limit,
        });

        const totalPages = Math.ceil(totalItems / limit);

        res.json({
            items,
            totalItems,
            totalPages,
            currentPage: page,
        });

    } catch (err) {
        console.error('Error in getItemsByCategory:', err);
        next(err);
    }
};