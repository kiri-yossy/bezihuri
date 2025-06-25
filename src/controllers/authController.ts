import { Request, Response } from 'express';
import { AppDataSource } from '../config/ormconfig';
import { User } from '../entity/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret';

// ユーザー登録
export const register = async (req: Request, res: Response): Promise<void> => { // ★戻り値の型を明示
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ message: '必須項目が不足しています。' });
      return; // ★早期リターンの場合は return; を残す
    }

    const userRepository = AppDataSource.getRepository(User);

    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'このメールアドレスは既に使用されています。' });
      return; // ★早期リターンの場合は return; を残す
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User();
    user.username = username;
    user.email = email;
    user.password = hashedPassword;

    await userRepository.save(user);

    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword); // ★return を削除

  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました。' }); // ★return を削除
  }
};

// ユーザーログイン
export const login = async (req: Request, res: Response): Promise<void> => { // ★戻り値の型を明示
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'メールアドレスとパスワードを入力してください。' });
      return; // ★早期リターンの場合は return; を残す
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      res.status(401).json({ message: 'メールアドレスまたはパスワードが正しくありません。' });
      return; // ★早期リターンの場合は return; を残す
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'メールアドレスまたはパスワードが正しくありません。' });
      return; // ★早期リターンの場合は return; を残す
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, userId: user.id, username: user.username }); // ★return を削除

  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました。' }); // ★return を削除
  }
};