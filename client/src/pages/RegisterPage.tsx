import React, { useState } from 'react';
import styles from './RegisterPage.module.css'; // ★レイアウト用CSSをインポート
import { Button } from '../components/Button';   // ★共通ボタンをインポート
import { Input } from '../components/Input';     // ★共通インプットをインポート

interface RegisterPageProps {
  onRegisterSuccess: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onRegisterSuccess }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // 送信中フラグ

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'エラーが発生しました。');
      }
      onRegisterSuccess();
    } catch (error) {
      if (error instanceof Error) {
        setMessage(`エラー: ${error.message}`);
      } else {
        setMessage('予期せぬエラーが発生しました。');
      }
      console.error('登録エラー:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.registerPageContainer}>
      <div className={styles.formContainer}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px', color: '#4a4a4a' }}>ユーザー登録</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <Input
              type="text"
              placeholder="ユーザー名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <Input
              type="email"
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <Input
              type="password"
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '登録中...' : '登録'}
            </Button>
          </div>
        </form>
        {message && <p className={styles.errorMessage}>{message}</p>}
      </div>
    </div>
  );
};