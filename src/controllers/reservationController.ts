import { Response, NextFunction } from 'express';
import { AppDataSource } from '../config/ormconfig';
import { Reservation, ReservationStatus } from '../entity/Reservation';
import { Item, ItemStatus } from '../entity/Item';
import { User } from '../entity/User';
import { Conversation } from '../entity/Conversation';
import { AuthRequest } from '../middleware/auth';

// 予約リクエストを作成する
export const createReservationRequest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const itemId = parseInt(req.params.itemId, 10);
        const currentUser = req.user as User;

        if (isNaN(itemId)) {
            res.status(400).json({ message: "無効な商品IDです。" });
            return;
        }

        const itemRepository = AppDataSource.getRepository(Item);
        const itemToReserve = await itemRepository.findOne({
            where: { id: itemId },
            relations: ["seller"],
        });

        if (!itemToReserve || itemToReserve.status !== ItemStatus.AVAILABLE) {
            res.status(400).json({ message: "現在予約できない商品です。" });
            return;
        }
        if (itemToReserve.seller.id === currentUser.id) {
            res.status(400).json({ message: "自分自身の商品は予約できません。" });
            return;
        }

        await AppDataSource.transaction(async transactionalEntityManager => {
            itemToReserve.status = ItemStatus.PENDING_RESERVATION;
            await transactionalEntityManager.save(itemToReserve);

            const newReservation = new Reservation();
            newReservation.buyer = currentUser;
            newReservation.item = itemToReserve;
            newReservation.priceAtReservation = itemToReserve.price;
            newReservation.status = ReservationStatus.PENDING_APPROVAL;
            await transactionalEntityManager.save(newReservation);
        });
        
        res.status(201).json({ message: "商品の予約リクエストを送信しました。" });
    } catch (err) { next(err); }
};

// 出品者が予約を承認する
export const approveReservation = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const reservationId = parseInt(req.params.reservationId, 10);
        const currentUser = req.user as User;

        const reservationRepo = AppDataSource.getRepository(Reservation);
        const reservation = await reservationRepo.findOne({
            where: { id: reservationId },
            relations: ["item", "item.seller", "buyer"],
        });

        if (!reservation) {
            res.status(404).json({ message: "予約リクエストが見つかりません。" });
            return;
        }
        if (reservation.item.seller.id !== currentUser.id) {
            res.status(403).json({ message: "この予約を操作する権限がありません。" });
            return;
        }
        if (reservation.status !== ReservationStatus.PENDING_APPROVAL) {
            res.status(400).json({ message: "承認待ちの予約ではありません。" });
            return;
        }

        await AppDataSource.transaction(async transactionalEntityManager => {
            reservation.status = ReservationStatus.RESERVED;
            reservation.item.status = ItemStatus.RESERVED;
            await transactionalEntityManager.save(reservation.item);
            await transactionalEntityManager.save(reservation);

            const conversationRepo = transactionalEntityManager.getRepository(Conversation);
            const newConversation = new Conversation();
            newConversation.reservation = reservation;
            newConversation.participants = [currentUser, reservation.buyer];
            await conversationRepo.save(newConversation);
        });

        res.json({ message: "予約を承認しました。チャットを開始できます。" });
    } catch (err) { 
        console.error('Error in approveReservation:', err);
        next(err); 
    }
};

// 出品者が予約を拒否する
export const rejectReservation = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const reservationId = parseInt(req.params.reservationId, 10);
        const currentUser = req.user as User;
        
        const reservationRepo = AppDataSource.getRepository(Reservation);
        const reservation = await reservationRepo.findOne({
            where: { id: reservationId },
            relations: ["item", "item.seller"],
        });

        if (!reservation) {
            res.status(404).json({ message: "予約リクエストが見つかりません。" });
            return;
        }
        if (reservation.item.seller.id !== currentUser.id) {
            res.status(403).json({ message: "この予約を操作する権限がありません。" });
            return;
        }
        if (reservation.status !== ReservationStatus.PENDING_APPROVAL) {
            res.status(400).json({ message: "承認待ちの予約ではありません。" });
            return;
        }

        await AppDataSource.transaction(async transactionalEntityManager => {
            reservation.status = ReservationStatus.REJECTED;
            reservation.item.status = ItemStatus.AVAILABLE;
            await transactionalEntityManager.save(reservation.item);
            await transactionalEntityManager.save(reservation);
        });

        res.json({ message: "予約を拒否しました。" });
    } catch (err) { next(err); }
};

// 出品者が取引を完了させる
export const completeReservation = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const reservationId = parseInt(req.params.reservationId, 10);
        const currentUser = req.user as User;

        const reservationRepo = AppDataSource.getRepository(Reservation);
        const reservation = await reservationRepo.findOne({
            where: { id: reservationId },
            relations: ["item", "item.seller"],
        });

        if (!reservation) {
            res.status(404).json({ message: "予約が見つかりません。" });
            return;
        }
        if (reservation.item.seller.id !== currentUser.id) {
            res.status(403).json({ message: "この取引を操作する権限がありません。" });
            return;
        }
        if (reservation.status !== ReservationStatus.RESERVED) {
            res.status(400).json({ message: "予約確定済みの取引ではありません。" });
            return;
        }

        await AppDataSource.transaction(async transactionalEntityManager => {
            reservation.status = ReservationStatus.COMPLETED;
            reservation.item.status = ItemStatus.SOLD_OUT;
            await transactionalEntityManager.save(reservation.item);
            await transactionalEntityManager.save(reservation);
        });

        res.json({ message: "取引を完了しました。" });
    } catch (err) { next(err); }
};

// 出品者に届いた予約リクエスト一覧を取得する
export const getReservationRequests = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const currentUser = req.user as User;

        if (!currentUser) {
            res.status(401).json({ message: "認証されていません。" });
            return;
        }

        const reservationRepository = AppDataSource.getRepository(Reservation);
        const requests = await reservationRepository.find({
            where: {
                item: { seller: { id: currentUser.id } },
                status: ReservationStatus.PENDING_APPROVAL,
            },
            relations: ["item", "buyer"],
            order: { createdAt: "DESC" },
        });

        res.json(requests);
    } catch (err) {
        console.error('Error in getReservationRequests:', err);
        next(err);
    }
};