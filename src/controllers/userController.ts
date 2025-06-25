import { Response, NextFunction } from 'express';
import { AppDataSource } from '../config/ormconfig';
import { Item } from '../entity/Item';
import { User } from '../entity/User';
import { AuthRequest } from '../middleware/auth';
import { Order } from '../entity/Order';

// ログイン中のユーザーが出品した商品を取得
export const getMyItems = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const currentUser = req.user as User;

        if (!currentUser) {
            res.status(401).json({ message: "認証されていません。" });
            return;
        }

        const itemRepository = AppDataSource.getRepository(Item);
        const items = await itemRepository.find({
            where: {
                seller: { id: currentUser.id } // ★ ここで出品者を絞り込む
            },
            order: { createdAt: "DESC" },
            relations: ["seller"], // 念のためseller情報もつけておく
        });

        res.json(items);

    } catch (err) {
        console.error('Error in getMyItems:', err);
        next(err);
    }
};

// ★★★ プロフィール更新API ★★★
export const updateMyProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { username, bio } = req.body;
        const currentUser = req.user as User;

        if (!currentUser) {
            res.status(401).json({ message: "認証されていません。" });
            return;
        }

        const userRepository = AppDataSource.getRepository(User);

        // 更新するプロパティを設定
        if (username !== undefined) {
            currentUser.username = username;
        }
        if (bio !== undefined) {
            currentUser.bio = bio;
        }

        // バリデーションもここで行うのが望ましい

        const updatedUser = await userRepository.save(currentUser);

        // パスワードは返さないように注意
        const { password, ...userWithoutPassword } = updatedUser;
        res.json(userWithoutPassword);

    } catch (err) {
        console.error('Error in updateMyProfile:', err);
        next(err);
    }
};

// ★★★ 自分のプロフィール情報を取得するAPI ★★★
export const getMyProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const currentUser = req.user as User;

        if (!currentUser) {
            res.status(401).json({ message: "認証されていません。" });
            return;
        }

        // パスワードは返さないように注意
        const { password, ...userWithoutPassword } = currentUser;
        res.json(userWithoutPassword);

    } catch (err) {
        console.error('Error in getMyProfile:', err);
        next(err);
    }
};

// ★★★ 購入した商品一覧を取得するAPI ★★★
export const getMyPurchases = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const currentUser = req.user as User;

        if (!currentUser) {
            res.status(401).json({ message: "認証されていません。" });
            return;
        }

        const orderRepository = AppDataSource.getRepository(Order);

        // ログイン中のユーザーが購入した注文履歴を取得
        const orders = await orderRepository.find({
            where: {
                buyer: { id: currentUser.id }
            },
            relations: ["item", "item.seller"], // 注文履歴から関連する商品とその出品者情報も取得
            order: { createdAt: "DESC" },
        });

        // 注文履歴から商品情報だけを抽出して返す
        const purchasedItems = orders.map(order => order.item);

        res.json(purchasedItems);

    } catch (err) {
        console.error('Error in getMyPurchases:', err);
        next(err);
    }
};