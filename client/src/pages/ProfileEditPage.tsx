import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ProfileEditPage.module.css'; // ★専用のCSSをインポート
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { TextArea } from '../components/TextArea';

// ユーザープロフィールの型定義
interface ProfileData {
  username: string;
  bio: string | null;
}

export const ProfileEditPage = () => {
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState<ProfileData>({ username: '', bio: '' });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('エラー: ログインしていません。');
        setLoading(false);
        return;
      }
      try {
        const response = await fetch('/api/users/me', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error('プロフィールデータの取得に失敗しました。');
        }
        const data = await response.json();
        setProfileData({
          username: data.username || '',
          bio: data.bio || '',
        });
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'エラーが発生しました');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('エラー: 認証情報がありません。');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'プロフィールの更新に失敗しました。');
      }

      alert('プロフィールが更新されました！');
      navigate('/mypage');

    } catch (error) {
      setMessage(error instanceof Error ? error.message : '予期せぬエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <p style={{textAlign: 'center', marginTop: '50px'}}>プロフィール情報を読み込んでいます...</p>;
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.formContainer}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px', color: '#4a4a4a' }}>プロフィール編集</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>ユーザー名</label>
            <Input
              type="text"
              name="username"
              value={profileData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>自己紹介</label>
            <TextArea
              name="bio"
              value={profileData.bio || ''}
              onChange={handleChange}
              rows={5}
              placeholder="よろしくお願いします！"
            />
          </div>
          <div className={styles.buttonGroup}>
            <Button type="button" onClick={() => navigate('/mypage')} className={styles.cancelButton}>
                キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '更新中...' : '更新する'}
            </Button>
          </div>
        </form>
        {message && <p className={styles.errorMessage}>{message}</p>}
      </div>
    </div>
  );
};