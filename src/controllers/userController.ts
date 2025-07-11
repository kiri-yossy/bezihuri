import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/ormconfig';
import { User } from '../entity/User';
import { Item } from '../entity/Item';
import { Reservation } from '../entity/Reservation';
import { Like } from '../entity/Like';
import { Follow } from '../entity/Follow';
import { AuthRequest } from '../middleware/auth';

// ログイン中のユーザー自身のプロフィール情報を取得
export const getMyProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const currentUser = req.user as User;
        if (!currentUser) {
            res.status(401).json({ message: "認証されていません。" });
            return;
        }
        // パスワードは返さない
        const { password, ...userWithoutPassword } = currentUser;
        res.json(userWithoutPassword);
    } catch (err) {
        next(err);
    }
};

// ログイン中のユーザーのプロフィールを更新
export const updateMyProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { username, bio } = req.body;
        const currentUser = req.user as User;
        if (!currentUser) {
            res.status(401).json({ message: "認証されていません。" });
            return;
        }
        const userRepository = AppDataSource.getRepository(User);
        if (username !== undefined) currentUser.username = username;
        if (bio !== undefined) currentUser.bio = bio;
        
        const updatedUser = await userRepository.save(currentUser);
        const { password, ...userWithoutPassword } = updatedUser;
        res.json(userWithoutPassword);
    } catch (err) {
        next(err);
    }
};

// ログイン中のユーザーが出品した商品一覧を取得
export const getMyItems = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const currentUser = req.user as User;
        if (!currentUser) {
            res.status(401).json({ message: "認証されていません。" });
            return;
        }
        const itemRepository = AppDataSource.getRepository(Item);
        const items = await itemRepository.find({
            where: { seller: { id: currentUser.id } },
            order: { createdAt: "DESC" },
            relations: ["seller", "likes", "likes.user"],
        });
        const itemsToSend = items.map(item => {
            const likeCount = item.likes.length;
            const isLikedByCurrentUser = item.likes.some(like => like.user.id === currentUser.id);
            const { likes, seller, ...restOfItem } = item;
            return { ...restOfItem, likeCount, isLikedByCurrentUser, seller: { id: seller.id, username: seller.username } };
        });
        res.json(itemsToSend);
    } catch (err) {
        next(err);
    }
};

// ログイン中のユーザーが予約した商品一覧を取得
export const getMyReservations = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const currentUser = req.user as User;
        if (!currentUser) {
            res.status(401).json({ message: "認証されていません。" });
            return;
        }
        const reservationRepository = AppDataSource.getRepository(Reservation);
        const reservations = await reservationRepository.find({
            where: { buyer: { id: currentUser.id } },
            relations: ["item", "item.seller", "item.likes", "item.likes.user"],
            order: { createdAt: "DESC" },
        });
        const reservedItems = reservations.map(reservation => {
            if (reservation.item) {
                const item = reservation.item;
                const likeCount = item.likes.length;
                const isLikedByCurrentUser = item.likes.some(like => like.user.id === currentUser.id);
                const { likes, seller, ...restOfItem } = item;
                return { ...restOfItem, likeCount, isLikedByCurrentUser, seller: { id: seller.id, username: seller.username }, reservationId: reservation.id, reservationStatus: reservation.status };
            }
            return null;
        }).filter(item => item !== null);
        res.json(reservedItems);
    } catch (err) {
        next(err);
    }
};

// ログイン中のユーザーがいいねした商品一覧を取得
export const getMyLikedItems = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const currentUser = req.user as User;
        if (!currentUser) {
            res.status(401).json({ message: "認証されていません。" });
            return;
        }
        const likeRepository = AppDataSource.getRepository(Like);
        const likes = await likeRepository.find({
            where: { user: { id: currentUser.id } },
            relations: ["item", "item.seller", "item.likes", "item.likes.user"],
            order: { createdAt: "DESC" },
        });
        const likedItems = likes.map(like => {
            if (like.item) {
                const item = like.item;
                const likeCount = item.likes.length;
                const isLikedByCurrentUser = true;
                const { likes, ...restOfItem } = item;
                return { ...restOfItem, likeCount, isLikedByCurrentUser };
            }
            return null;
        }).filter(item => item !== null);
        res.json(likedItems);
    } catch (err) {
        next(err);
    }
};

// ★★★ 特定ユーザーの公開プロフィール情報を取得 (ここに統合) ★★★
export const getUserProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = parseInt(req.params.userId, 10);
        const currentUser = req.user; // ログインしていればユーザー情報、していなければundefined

        if (isNaN(userId)) {
            res.status(400).json({ message: "無効なユーザーIDです。" });
            return;
        }

        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({
            where: { id: userId },
            relations: ["followers", "following"],
        });

        if (!user) {
            res.status(404).json({ message: "ユーザーが見つかりません。" });
            return;
        }

        let isFollowing = false;
        if (currentUser) {
            const followRepository = AppDataSource.getRepository(Follow);
            const follow = await followRepository.findOneBy({
                follower: { id: currentUser.id },
                following: { id: user.id },
            });
            if (follow) isFollowing = true;
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, email, verificationToken, ...publicProfile } = user;
        
        res.json({
            ...publicProfile,
            followersCount: user.followers.length,
            followingCount: user.following.length,
            isFollowing: isFollowing,
        });
    } catch (err) {
        next(err);
    }
};