import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './ReviewPage.module.css';
import { Button } from '../components/Button';
import { TextArea } from '../components/TextArea';
import { useToast } from '../context/ToastContext';
import { fetchApi } from '../apiClient';

export const ReviewPage = () => {
  const { reservationId } = useParams<{ reservationId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [rating, setRating] = useState<'good' | 'normal' | 'bad'>('good');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetchApi(`/api/reservations/${reservationId}/review`, {
        method: 'POST',
        body: JSON.stringify({ rating, comment }),
      });
      showToast('評価を投稿しました。ご協力ありがとうございます！', 'success');
      navigate('/mypage');
    } catch (error) {
      showToast(error instanceof Error ? error.message : '評価の投稿に失敗しました。', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.formContainer}>
        <h2>取引相手を評価する</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>評価</label>
            <div className={styles.ratingGroup}>
              <button type="button" onClick={() => setRating('good')} className={`${styles.ratingButton} ${rating === 'good' ? styles.good : ''}`}>良い</button>
              <button type="button" onClick={() => setRating('normal')} className={`${styles.ratingButton} ${rating === 'normal' ? styles.normal : ''}`}>普通</button>
              <button type="button" onClick={() => setRating('bad')} className={`${styles.ratingButton} ${rating === 'bad' ? styles.bad : ''}`}>悪い</button>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>コメント (任意)</label>
            <TextArea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              placeholder="取引相手へのメッセージを記入しましょう"
            />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '投稿中...' : '評価を投稿する'}
          </Button>
        </form>
      </div>
    </div>
  );
};