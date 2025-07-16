import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // ★ Link を削除
import styles from './MyPage.module.css';
import { ItemCard } from '../components/ItemCard';
import { FollowButton } from '../components/FollowButton';
import { fetchApi } from '../apiClient';
import { useToast } from '../context/ToastContext';

// 型定義
interface UserProfile {
    id: number;
    username: string;
    bio: string | null;
    followersCount: number;
    followingCount: number;
    isFollowing: boolean;
}
interface Review {
    id: number;
    rating: 'good' | 'normal' | 'bad';
    comment: string | null;
    createdAt: string;
    reviewer: { id: number; username: string; };
}
interface Item {
    id: number;
    title: string;
    price: number;
    imageUrls: string[];
    likeCount: number;
    isLikedByCurrentUser: boolean;
}

export const UserProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const { showToast } = useToast();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentUserId = Number(localStorage.getItem('userId'));

  useEffect(() => {
    if (!userId) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [profileData, reviewsData, itemsData] = await Promise.all([
          fetchApi(`/api/users/${userId}`),
          fetchApi(`/api/users/${userId}/reviews`),
          fetchApi(`/api/users/${userId}/items`)
        ]);
        setUser(profileData);
        setReviews(reviewsData);
        setItems(itemsData);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'データの取得に失敗しました。';
        setError(msg);
        showToast(msg, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId, showToast]);

  const getRatingLabel = (rating: 'good' | 'normal' | 'bad') => {
    switch (rating) {
        case 'good': return '良い';
        case 'normal': return '普通';
        case 'bad': return '悪い';
        default: return '';
    }
  };

  if (loading) { return <p className={styles.centeredMessage}>ユーザー情報を読み込んでいます...</p>; }
  if (error) { return <p className={styles.centeredMessage} style={{ color: 'red' }}>エラー: {error}</p>; }
  if (!user) { return <p className={styles.centeredMessage}>ユーザーが見つかりません。</p>; }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.profileSection}>
        <div className={styles.profileIconPlaceholder}></div>
        <h2 className={styles.username}>{user.username}</h2>
        
        <div className={styles.followStats}>
            <span>フォロー中 {user.followingCount}</span>
            <span>|</span>
            <span>フォロワー {user.followersCount}</span>
        </div>
        
        {currentUserId !== user.id && (
            <div className={styles.followButtonContainer}>
                <FollowButton 
                  targetUserId={user.id} 
                  initialIsFollowing={user.isFollowing} 
                />
            </div>
        )}
        
        <p className={styles.bio}>{user.bio || '自己紹介文はありません。'}</p>
      </div>

      <div className={styles.contentSection}>
        <div className={styles.tabNav}>
            <div className={styles.activeTab}>評価</div>
        </div>
        <div className={styles.tabContent}>
            {reviews.length > 0 ? (
                reviews.map(review => (
                    <div key={review.id} className={styles.reviewItem}>
                        <div className={styles.reviewHeader}>
                            <span className={`${styles.ratingBadge} ${styles[review.rating]}`}>
                                {getRatingLabel(review.rating)}
                            </span>
                            <span className={styles.reviewUser}>from {review.reviewer.username}</span>
                        </div>
                        <p className={styles.reviewComment}>{review.comment}</p>
                        <p className={styles.reviewDate}>{new Date(review.createdAt).toLocaleDateString('ja-JP')}</p>
                    </div>
                ))
            ) : (
                <p>まだ評価はありません。</p>
            )}
        </div>

        <h3 className={styles.itemsHeader}>このユーザーの出品商品</h3>
        <div className={styles.itemList}>
            {items.length > 0 ? (
                items.map(item => <ItemCard key={item.id} item={item} />)
            ) : (
                <p>出品中の商品はありません。</p>
            )}
        </div>
      </div>
    </div>
  );
};