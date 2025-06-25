// /src/controllers/orderController.ts

import { Response, NextFunction } from 'express';
import { AppDataSource } from '../config/ormconfig';
import { Order } from '../entity/Order';
import { Item, ItemStatus } from '../entity/Item';
import { User } from '../entity/User';
import { AuthRequest } from '../middleware/auth';

// 商品を購入する
export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { itemId } = req.body;
        const currentUser = req.user as User;

        if (!itemId) {
            res.status(400).json({ message: "商品IDが必要です。" });
            return;
        }

        const itemRepository = AppDataSource.getRepository(Item);
        const orderRepository = AppDataSource.getRepository(Order);

        const itemToPurchase = await itemRepository.findOne({
            where: { id: itemId },
            relations: ["seller"],
        });

        // 1. 商品が存在するか、出品中か確認
        if (!itemToPurchase || itemToPurchase.status !== ItemStatus.AVAILABLE) {
            res.status(404).json({ message: "購入可能な商品ではありません。" });
            return;
        }

        // 2. 自分の商品ではないか確認
        if (itemToPurchase.seller.id === currentUser.id) {
            res.status(400).json({ message: "自分自身の商品を購入することはできません。" });
            return;
        }

        // 3. 取引を作成し、商品のステータスを更新 (トランザクション内で実行)
        await AppDataSource.transaction(async transactionalEntityManager => {
            // 商品のステータスを 'sold_out' に更新
            itemToPurchase.status = ItemStatus.SOLD_OUT;
            await transactionalEntityManager.save(itemToPurchase);

            // 注文履歴を作成
            const newOrder = new Order();
            newOrder.buyer = currentUser;
            newOrder.item = itemToPurchase;
            newOrder.priceAtPurchase = itemToPurchase.price; // 取引時の価格を記録
            await transactionalEntityManager.save(newOrder);
        });
        
        res.status(201).json({ message: "商品の購入が完了しました。" });

    } catch (err) {
        console.error('Error in createOrder:', err);
        next(err);
    }
};