import React, { useState } from 'react';
import styles from './RegisterPage.module.css';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { fetchApi } from '../apiClient';

interface RegisterPageProps {
  onRegisterSuccess: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onRegisterSuccess }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setIsSubmitting(true);
    try {
      await fetchApi('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
      });
      onRegisterSuccess();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '予期せぬエラーが発生しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.registerPageContainer}>
      <div className={styles.formContainer}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px', color: '#4a4a4a' }}>ユーザー登録</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}><Input type="text" placeholder="ユーザー名" value={username} onChange={(e) => setUsername(e.target.value)} required /></div>
          <div className={styles.formGroup}><Input type="email" placeholder="メールアドレス" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div className={styles.formGroup}><Input type="password" placeholder="パスワード" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
          <div className={styles.formGroup}><Button type="submit" disabled={isSubmitting}>{isSubmitting ? '登録中...' : '登録'}</Button></div>
        </form>
        {message && <p className={styles.errorMessage}>{message}</p>}
      </div>
    </div>
  );
};