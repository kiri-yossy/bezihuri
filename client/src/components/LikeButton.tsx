import React, { useState } from 'react';
import styles from './LikeButton.module.css';

interface LikeButtonProps {
  itemId: number;
  initialLiked: boolean;
  initialLikeCount: number;
}

export const LikeButton: React.FC<LikeButtonProps> = ({ itemId, initialLiked, initialLikeCount }) => {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      alert('いいねするにはログインが必要です。');
      setIsLoading(false);
      return;
    }

    const method = isLiked ? 'DELETE' : 'POST';
    const endpoint = `/api/items/${itemId}/like`;

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // 成功した場合、状態を反転させる
        setIsLiked(!isLiked);
        setLikeCount(prevCount => isLiked ? prevCount - 1 : prevCount + 1);
      } else {
        const data = await response.json();
        alert(`エラー: ${data.message || '操作に失敗しました。'}`);
      }
    } catch (error) {
      alert('エラー: 通信に失敗しました。');
      console.error("Like button error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className={`${styles.likeButton} ${isLiked ? styles.liked : ''}`}
      onClick={handleClick}
      disabled={isLoading}
    >
      ❤️ <span className={styles.likeCount}>{likeCount}</span>
    </button>
  );
};