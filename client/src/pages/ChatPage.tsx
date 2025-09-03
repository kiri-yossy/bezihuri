import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import styles from './ChatPage.module.css';
import { fetchApi } from '../apiClient';
import { Button } from '../components/Button';
import { TextArea } from '../components/TextArea';
import { useToast } from '../context/ToastContext';
import { io, Socket } from 'socket.io-client'; // ★ socket.io-clientをインポート

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

// RenderのURLか、ローカルのURLかを判断
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const ChatPage = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const currentUserId = Number(localStorage.getItem('userId'));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // WebSocket接続の管理
  useEffect(() => {
    // WebSocketサーバーに接続
    const newSocket = io(API_BASE_URL);
    setSocket(newSocket);
    console.log('Attempting to connect to WebSocket server...');

    newSocket.on('connect', () => {
      console.log('WebSocket connected! ID:', newSocket.id);
      if (conversationId) {
        newSocket.emit('joinRoom', conversationId);
      }
    });

    // サーバーから新しいメッセージを受信したときのリスナー
    newSocket.on('receiveMessage', (receivedMessage: Message) => {
      console.log('New message received:', receivedMessage);
      setMessages(prevMessages => [...prevMessages, receivedMessage]);
    });
    
    // コンポーネントがアンマウントされるときに接続をクリーンアップ
    return () => {
      console.log('Disconnecting WebSocket...');
      newSocket.disconnect();
    };
  }, [conversationId]);

  // 初回のメッセージ履歴取得
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
    if (!newMessage.trim() || !socket) return;

    setIsSending(true);
    try {
      // 1. データベースにメッセージを保存するために、通常のAPIも呼び出す
      const sentMessage = await fetchApi(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ text: newMessage }),
      });
      
      // 2. 自分の画面にメッセージを即時反映
      setMessages(prevMessages => [...prevMessages, sentMessage]);

      // 3. WebSocketを通じて、相手にリアルタイムでメッセージを送信
      socket.emit('sendMessage', {
        conversationId: conversationId,
        message: sentMessage,
      });

      setNewMessage('');
    } catch (err) {
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
          rows={2}
          required
        />
        <Button type="submit" disabled={isSending}>
          {isSending ? '送信中...' : '送信'}
        </Button>
      </form>
    </div>
  );
};