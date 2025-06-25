import React, { useState } from 'react';
import styles from './LoginPage.module.css';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { fetchApi } from '../apiClient';

interface LoginPageProps {
  onLoginSuccess: (token: string, userId: number) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setIsSubmitting(true);
    try {
      const data = await fetchApi('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (data.token && data.userId) {
        onLoginSuccess(data.token, data.userId);
      } else {
        throw new Error('トークンまたはユーザーIDが取得できませんでした。');
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '予期せぬエラーが発生しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.loginPageContainer}>
      <div className={styles.formContainer}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px', color: '#4a4a4a' }}>ログイン</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}><Input type="email" placeholder="メールアドレス" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div className={styles.formGroup}><Input type="password" placeholder="パスワード" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
          <div className={styles.formGroup}><Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'ログイン中...' : 'ログイン'}</Button></div>
        </form>
        {message && <p className={styles.errorMessage}>{message}</p>}
      </div>
    </div>
  );
};