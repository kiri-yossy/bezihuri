import React, { useState, useEffect, useCallback } from 'react';
import styles from './CommentSection.module.css';
import { fetchApi } from '../apiClient';
import { Button } from './Button';
import { TextArea } from './TextArea';

// 型定義
interface User {
  id: number;
  username: string;
}
interface Comment {
  id: number;
  text: string;
  createdAt: string;
  user: User;
}
interface CommentSectionProps {
  itemId: number;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ itemId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoggedIn = !!localStorage.getItem('token');

  const fetchComments = useCallback(async () => {
    try {
      const data = await fetchApi(`/api/items/${itemId}/comments`);
      setComments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'コメントの取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleCommentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const postedComment = await fetchApi(`/api/items/${itemId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text: newComment }),
      });
      // 新しいコメントをリストの先頭に追加して、UIを即時更新
      setComments(prevComments => [postedComment, ...prevComments]);
      setNewComment(''); // 入力欄をクリア
    } catch (err) {
      setError(err instanceof Error ? err.message : 'コメントの投稿に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.commentSection}>
      <h3>コメント</h3>
      
      {/* コメント投稿フォーム */}
      {isLoggedIn && (
        <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
          <TextArea
            placeholder="商品についての質問などを投稿しましょう"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            required
            rows={4}
          />
          <div className={styles.buttonWrapper}>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '投稿中...' : 'コメントを投稿する'}
            </Button>
          </div>
        </form>
      )}

      {error && <p className={styles.errorMessage}>{error}</p>}

      {/* コメント一覧 */}
      <div className={styles.commentList}>
        {loading ? (
          <p>コメントを読み込んでいます...</p>
        ) : comments.length > 0 ? (
          comments.map(comment => (
            <div key={comment.id} className={styles.commentItem}>
              <div className={styles.commentHeader}>
                <span className={styles.username}>{comment.user.username}</span>
                <span className={styles.timestamp}>{new Date(comment.createdAt).toLocaleString('ja-JP')}</span>
              </div>
              <p className={styles.commentText}>{comment.text}</p>
            </div>
          ))
        ) : (
          <p>まだコメントはありません。</p>
        )}
      </div>
    </div>
  );
};