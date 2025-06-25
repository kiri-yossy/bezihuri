import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ProfileEditPage.module.css';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { TextArea } from '../components/TextArea';
import { useToast } from '../context/ToastContext';
import { fetchApi } from '../apiClient';

interface ProfileData { username: string; bio: string | null; }

export const ProfileEditPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [profileData, setProfileData] = useState<ProfileData>({ username: '', bio: '' });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await fetchApi('/api/users/me');
        setProfileData({ username: data.username || '', bio: data.bio || '' });
      } catch (error) { showToast(error instanceof Error ? error.message : 'エラーが発生しました', 'error'); } finally { setLoading(false); }
    };
    fetchProfile();
  }, [showToast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetchApi('/api/users/me', { method: 'PUT', body: JSON.stringify(profileData) });
      showToast('プロフィールが更新されました！', 'success');
      navigate('/mypage');
    } catch (error) { showToast(error instanceof Error ? error.message : 'エラーが発生しました', 'error'); } finally { setIsSubmitting(false); }
  };

  if (loading) { return <p style={{textAlign: 'center', marginTop: '50px'}}>プロフィール情報を読み込んでいます...</p>; }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.formContainer}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px', color: '#4a4a4a' }}>プロフィール編集</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}><label className={styles.label}>ユーザー名</label><Input type="text" name="username" value={profileData.username} onChange={handleChange} required /></div>
          <div className={styles.formGroup}><label className={styles.label}>自己紹介</label><TextArea name="bio" value={profileData.bio || ''} onChange={handleChange} rows={5} placeholder="よろしくお願いします！" /></div>
          <div className={styles.buttonGroup}><Button type="button" onClick={() => navigate('/mypage')} className={styles.cancelButton}>キャンセル</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting ? '更新中...' : '更新する'}</Button></div>
        </form>
      </div>
    </div>
  );
};