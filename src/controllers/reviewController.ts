import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/ormconfig';
import { Review, Rating } from '../entity/Review';
import { Reservation, ReservationStatus } from '../entity/Reservation';
import { User } from '../entity/User';
import { AuthRequest } from '../middleware/auth';

// 評価を投稿する
export const createReview = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const reservationId = parseInt(req.params.reservationId, 10);
        const { rating, comment } = req.body;
        const currentUser = req.user as User;

        if (!Object.values(Rating).includes(rating)) {
            res.status(400).json({ message: "評価の値が不正です。" });
            return;
        }

        const reservationRepo = AppDataSource.getRepository(Reservation);
        const reservation = await reservationRepo.findOne({
            where: { id: reservationId },
            relations: ["buyer", "item", "item.seller", "review"],
        });

        if (!reservation) {
            res.status(404).json({ message: "取引が見つかりません。" });
            return;
        }
        if (reservation.status !== ReservationStatus.COMPLETED) {
            res.status(400).json({ message: "完了した取引のみ評価できます。" });
            return;
        }
        if (reservation.buyer.id !== currentUser.id && reservation.item.seller.id !== currentUser.id) {
            res.status(403).json({ message: "この取引を評価する権限がありません。" });
            return;
        }
        if (reservation.review) {
            res.status(400).json({ message: "この取引は既に評価済みです。" });
            return;
        }

        const reviewee = reservation.buyer.id === currentUser.id ? reservation.item.seller : reservation.buyer;

        const reviewRepo = AppDataSource.getRepository(Review);
        const newReview = new Review();
        newReview.rating = rating;
        newReview.comment = comment;
        newReview.reservation = reservation;
        newReview.reviewer = currentUser;
        newReview.reviewee = reviewee;

        await reviewRepo.save(newReview);
        res.status(201).json(newReview);

    } catch (err) { next(err); }
};

// 特定ユーザーの受け取った評価一覧を取得
export const getUserReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = parseInt(req.params.userId, 10);
        const reviewRepo = AppDataSource.getRepository(Review);

        const reviews = await reviewRepo.find({
            where: { reviewee: { id: userId } },
            relations: ["reviewer"],
            order: { createdAt: "DESC" },
        });

        res.json(reviews);
    } catch (err) { next(err); }
};