import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/ormconfig';
import { User } from '../entity/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendVerificationEmail } from '../utils/email';

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            res.status(400).json({ message: '必須項目が不足しています。' });
            return;
        }

        const userRepository = AppDataSource.getRepository(User);
        const existingUser = await userRepository.findOne({ where: { email } });
        if (existingUser) {
            res.status(400).json({ message: 'このメールアドレスは既に使用されています。' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        const user = new User();
        user.username = username;
        user.email = email;
        user.password = hashedPassword;
        user.verificationToken = verificationToken;
        // isVerified は User エンティティのデフォルト値で設定されます

        const newUser = await userRepository.save(user);

        // メール認証が有効な場合のみメールを送信します
        if (process.env.EMAIL_VERIFICATION_ENABLED === 'true') {
            try {
                await sendVerificationEmail(newUser.email, verificationToken);
                console.log(`Verification email sent to ${newUser.email}`);
            } catch (emailError) {
                console.error("Failed to send verification email:", emailError);
            }
        }
        
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, verificationToken: __, ...userWithoutSensitiveData } = newUser;
        res.status(201).json(userWithoutSensitiveData);

    } catch (err) {
        console.error('Registration error:', err);
        next(err);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: 'メールアドレスとパスワードを入力してください。' });
            return;
        }
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { email } });
        if (!user) {
            res.status(401).json({ message: 'メールアドレスまたはパスワードが正しくありません。' });
            return;
        }
        
        // メール認証が有効な場合のみ、認証済みかチェックします
        if (process.env.EMAIL_VERIFICATION_ENABLED === 'true' && !user.isVerified) {
            res.status(403).json({ message: 'メールアドレスが認証されていません。メールボックスを確認してください。' });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: 'メールアドレスまたはパスワードが正しくありません。' });
            return;
        }
        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '10s' }
        );
        res.json({ token, userId: user.id, username: user.username });
    } catch (err) {
        console.error('Login error:', err);
        next(err);
    }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { token } = req.body;
        if (!token) {
            res.status(400).json({ message: "認証トークンが必要です。" });
            return;
        }
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOneBy({ verificationToken: token });
        if (!user) {
            res.status(404).json({ message: "無効な認証トークンです。ユーザーが見つかりません。" });
            return;
        }
        user.isVerified = true;
        user.verificationToken = null;
        await userRepository.save(user);
        res.json({ message: "メールアドレスの認証が完了しました！ログインしてください。" });
    } catch (err) {
        console.error('Error in verifyEmail:', err);
        next(err);
    }
};