// /src/controllers/followController.ts

import { Response, NextFunction } from 'express';
import { AppDataSource } from '../config/ormconfig';
import { Follow } from '../entity/Follow';
import { User } from '../entity/User';
import { AuthRequest } from '../middleware/auth';

// ユーザーをフォローする
export const followUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userIdToFollow = parseInt(req.params.userId, 10);
        const currentUser = req.user as User;

        if (currentUser.id === userIdToFollow) {
            res.status(400).json({ message: "自分自身をフォローすることはできません。" });
            return;
        }

        const followRepository = AppDataSource.getRepository(Follow);
        const userRepository = AppDataSource.getRepository(User);

        const userToFollow = await userRepository.findOneBy({ id: userIdToFollow });
        if (!userToFollow) {
            res.status(404).json({ message: "フォロー対象のユーザーが見つかりません。" });
            return;
        }

        const existingFollow = await followRepository.findOneBy({
            follower: { id: currentUser.id },
            following: { id: userIdToFollow },
        });

        if (existingFollow) {
            res.status(400).json({ message: "既にフォローしています。" });
            return;
        }

        const newFollow = new Follow();
        newFollow.follower = currentUser;
        newFollow.following = userToFollow;
        await followRepository.save(newFollow);

        res.status(201).json({ message: `${userToFollow.username}さんをフォローしました。` });
    } catch (err) {
        next(err);
    }
};

// ユーザーのフォローを解除する
export const unfollowUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userIdToUnfollow = parseInt(req.params.userId, 10);
        const currentUser = req.user as User;

        const followRepository = AppDataSource.getRepository(Follow);
        const followToRemove = await followRepository.findOneBy({
            follower: { id: currentUser.id },
            following: { id: userIdToUnfollow },
        });

        if (!followToRemove) {
            res.status(404).json({ message: "フォローしていません。" });
            return;
        }

        await followRepository.remove(followToRemove);
        res.status(204).send();
    } catch (err) {
        next(err);
    }
};