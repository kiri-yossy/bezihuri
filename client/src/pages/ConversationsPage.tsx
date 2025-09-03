import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './ConversationsPage.module.css';
import { fetchApi } from '../apiClient';

// 型定義
interface Conversation {
  id: number;
  updatedAt: string;
  reservation: {
    id: number;
    item: {
      title: string;
    }
  };
  participants: {
    id: number;
    username: string;
  }[];
}

export const ConversationsPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = Number(localStorage.getItem('userId'));

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await fetchApi('/api/conversations');
        setConversations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '会話の取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  if (loading) {
    return <p>会話を読み込んでいます...</p>;
  }
  if (error) {
    return <p style={{ color: 'red' }}>エラー: {error}</p>;
  }

  return (
    <div className={styles.pageContainer}>
      <h2>メッセージ</h2>
      <div className={styles.conversationList}>
        {conversations.length > 0 ? (
          conversations.map(conv => {
            const otherParticipant = conv.participants.find(p => p.id !== currentUserId);
            return (
              <Link to={`/chat/${conv.id}`} key={conv.id} className={styles.conversationItem}>
                <div className={styles.iconPlaceholder}></div>
                <div className={styles.conversationInfo}>
                  <p className={styles.participantName}>{otherParticipant ? otherParticipant.username : '不明なユーザー'}</p>
                  <p className={styles.itemTitle}>商品: {conv.reservation.item.title}</p>
                </div>
                <span className={styles.timestamp}>{new Date(conv.updatedAt).toLocaleDateString('ja-JP')}</span>
              </Link>
            );
          })
        ) : (
          <p>まだ会話はありません。</p>
        )}
      </div>
    </div>
  );
};