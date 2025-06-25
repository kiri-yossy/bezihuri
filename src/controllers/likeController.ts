import { Response, NextFunction } from 'express';
import { AppDataSource } from '../config/ormconfig';
import { Like } from '../entity/Like';
import { Item } from '../entity/Item';
import { User } from '../entity/User';
import { AuthRequest } from '../middleware/auth';

// 商品に「いいね」を追加
export const addLike = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const itemId = parseInt(req.params.itemId, 10);
        const currentUser = req.user as User;

        if (isNaN(itemId)) {
            res.status(400).json({ message: "無効な商品IDです。" });
            return;
        }

        const likeRepository = AppDataSource.getRepository(Like);
        const itemRepository = AppDataSource.getRepository(Item);

        const item = await itemRepository.findOneBy({ id: itemId });
        if (!item) {
            res.status(404).json({ message: "対象の商品が見つかりません。" });
            return;
        }

        const existingLike = await likeRepository.findOne({
            where: {
                item: { id: itemId },
                user: { id: currentUser.id }
            }
        });

        if (existingLike) {
            res.status(400).json({ message: "既にいいね済みです。" });
            return;
        }

        const newLike = new Like();
        newLike.item = item;
        newLike.user = currentUser;
        await likeRepository.save(newLike);

        res.status(201).json({ message: "いいねしました。" });

    } catch (err) {
        console.error('Error in addLike:', err);
        next(err);
    }
};

// ★★★ 商品の「いいね」を削除 (デバッグログ追加版) ★★★
export const removeLike = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    console.log('[DEBUG] removeLike: Function start');
    try {
        const itemId = parseInt(req.params.itemId, 10);
        const currentUser = req.user as User;

        console.log(`[DEBUG] removeLike: Attempting to remove like for itemID: ${itemId} by userID: ${currentUser?.id}`);

        if (isNaN(itemId) || !currentUser) {
            console.log('[DEBUG] removeLike: Invalid itemId or no user');
            res.status(400).json({ message: "無効なリクエストです。" });
            return;
        }

        const likeRepository = AppDataSource.getRepository(Like);

        console.log('[DEBUG] removeLike: Searching for the "like" to remove...');
        const likeToRemove = await likeRepository.findOne({
            where: {
                item: { id: itemId },
                user: { id: currentUser.id }
            }
        });
        
        if (!likeToRemove) {
            console.log('[DEBUG] removeLike: Like not found, sending 404');
            res.status(404).json({ message: "いいねが見つかりません。" });
            return;
        }
        
        console.log('[DEBUG] removeLike: Found "like" to remove. ID:', likeToRemove.id);
        console.log('[DEBUG] removeLike: Removing from database...');
        
        await likeRepository.remove(likeToRemove);
        
        console.log('[DEBUG] removeLike: Remove successful. Sending 204 response.');
        res.status(204).send();

    } catch (err) {
        console.error('[DEBUG] removeLike: CATCH BLOCK ERROR:', err);
        next(err);
    }
};