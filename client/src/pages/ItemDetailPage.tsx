import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styles from './ItemDetailPage.module.css';
import { Button } from '../components/Button';
import { LikeButton } from '../components/LikeButton';
import { useToast } from '../context/ToastContext';
import { fetchApi } from '../apiClient';

// 型定義
interface Item {
  id: number;
  title: string;
  description: string;
  price: number;
  status: string;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
  seller: { id: number; username: string; };
  likeCount: number;
  isLikedByCurrentUser: boolean;
}

export const ItemDetailPage = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loggedInUserId = Number(localStorage.getItem('userId'));

  const fetchItemDetail = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchApi(`/api/items/${itemId}`);
      setItem(data);
    } catch (error) {
      const msg = error instanceof Error ? error.message : '予期せぬエラーが発生しました';
      setErrorMessage(msg);
      showToast(msg, 'error');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [itemId, showToast, navigate]);

  useEffect(() => {
    fetchItemDetail();
  }, [fetchItemDetail]);

  const handleDelete = async () => {
    if (!window.confirm('本当にこの商品を削除しますか？')) return;
    setIsProcessing(true); // ★ ここで isProcessing を true に設定
    try {
      await fetchApi(`/api/items/${itemId}`, { method: 'DELETE' });
      showToast('商品を削除しました。', 'success');
      navigate('/');
    } catch (error) {
      showToast(`エラー: ${(error as Error).message}`, 'error');
    } finally {
      setIsProcessing(false); // ★ ここで isProcessing を false に戻す
    }
  };
  
  if (loading) { return <p className={styles.centeredMessage}>商品を読み込んでいます...</p>; }
  if (errorMessage) { return <p className={styles.centeredMessage} style={{ color: 'red' }}>エラー: {errorMessage}</p>; }
  if (!item) { return <p className={styles.centeredMessage}>商品情報が見つかりませんでした。</p>; }

  const isOwner = loggedInUserId === item.seller.id;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.itemContainer}>
        <div className={styles.imageSection}>
          {item.imageUrls && item.imageUrls.length > 0 ? (
            <img src={item.imageUrls[0]} alt={item.title} className={styles.mainImage} />
          ) : (
            <div className={styles.noImagePlaceholder}>画像なし</div>
          )}
        </div>
        <div className={styles.infoSection}>
          <div className={styles.sellerInfo}>
            <div className={styles.sellerIcon}></div>
            <Link to={`/users/${item.seller.id}`} className={styles.sellerName}>{item.seller.username}</Link>
          </div>
          <h1 className={styles.title}>{item.title}</h1>
          <p className={styles.price}>¥{item.price.toLocaleString()}</p>
          <div className={styles.actions}>
            <LikeButton 
              itemId={item.id}
              initialLiked={item.isLikedByCurrentUser}
              initialLikeCount={item.likeCount}
            />
            <button className={styles.commentButton}>💬 コメント</button>
          </div>
          <div className={styles.reserveButtonContainer}>
            {item.status !== 'available' ? (
                <Button disabled={true}>{item.status === 'reserved' ? '予約済み' : '受け渡し完了'}</Button>
            ) : isOwner ? (
                <Button disabled={true}>自分の商品です</Button>
            ) : loggedInUserId ? (
                <Link to={`/items/${item.id}/reserve`} style={{textDecoration: 'none', width: '100%'}}>
                    <Button>この商品を予約する</Button>
                </Link>
            ) : (
                <Button onClick={() => navigate('/login')}>ログインして予約</Button>
            )}
          </div>
          <div className={styles.description}>
            <h3>商品の説明</h3>
            <p>{item.description}</p>
          </div>
          {isOwner && (
            <div className={styles.ownerMenu}>
              <Link to={`/items/${item.id}/edit`}>
                <button className={styles.editButton}>商品を編集</button>
              </Link>
              <button onClick={handleDelete} disabled={isProcessing} className={styles.deleteButton}>この商品を削除</button>
            </div>
          )}
        </div>
      </div>
      {/* コメントセクションは別コンポーネントなので、ここでは呼び出すだけ */}
    </div>
  );
};