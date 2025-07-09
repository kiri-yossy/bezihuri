import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import styles from './ChatPage.module.css';
import { fetchApi } from '../apiClient';
import { Button } from '../components/Button';
import { TextArea } from '../components/TextArea';
import { useToast } from '../context/ToastContext'; // ★ useToastをインポート

// 型定義
interface Message {
  id: number;
  text: string;
  createdAt: string;
  sender: {
    id: number;
    username: string;
  };
}

export const ChatPage = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const currentUserId = Number(localStorage.getItem('userId'));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast(); // ★ Toast表示用の関数を取得

  // メッセージリストの最下部に自動スクロール
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await fetchApi(`/api/conversations/${conversationId}/messages`);
        setMessages(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'メッセージの取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    };
    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId]);

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      const sentMessage = await fetchApi(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ text: newMessage }),
      });
      setMessages(prevMessages => [...prevMessages, sentMessage]);
      setNewMessage('');
    } catch (err) {
      // ★★★ ここを修正 ★★★
      // alertの代わりに、より具体的なエラーをトーストで表示
      showToast(err instanceof Error ? err.message : 'メッセージの送信に失敗しました。', 'error');
    } finally {
      setIsSending(false);
    }
  };

  if (loading) return <p>メッセージを読み込んでいます...</p>;
  if (error) return <p style={{ color: 'red' }}>エラー: {error}</p>;

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messageList}>
        {messages.map(msg => (
          <div 
            key={msg.id}
            className={`${styles.messageBubble} ${msg.sender.id === currentUserId ? styles.myMessage : styles.theirMessage}`}
          >
            <p className={styles.messageText}>{msg.text}</p>
            <span className={styles.timestamp}>{new Date(msg.createdAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className={styles.messageForm}>
        <TextArea 
          placeholder="メッセージを入力..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          rows={3}
          required
        />
        <Button type="submit" disabled={isSending}>
          {isSending ? '送信中...' : '送信'}
        </Button>
      </form>
    </div>
  );
};