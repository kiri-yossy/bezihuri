import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styles from './ItemDetailPage.module.css';
import { Button } from '../components/Button';
import { LikeButton } from '../components/LikeButton';
import { useToast } from '../context/ToastContext';
import { fetchApi } from '../apiClient';
import { CommentSection } from '../components/CommentSection';

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

  const loggedInUserIdString = localStorage.getItem('userId');
  const loggedInUserId = loggedInUserIdString ? parseInt(loggedInUserIdString, 10) : null;

  const fetchItemDetail = useCallback(async () => {
    if (!itemId) {
        setLoading(false);
        setErrorMessage("商品IDが指定されていません。");
        return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchApi(`/api/items/${itemId}`);
      setItem(data);
    } catch (error) {
      const msg = error instanceof Error ? error.message : '予期せぬエラーが発生しました';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, [itemId, showToast]);

  useEffect(() => {
    fetchItemDetail();
  }, [fetchItemDetail]);

  const handleDelete = async () => {
    if (!window.confirm('本当にこの商品を削除しますか？')) return;
    setIsProcessing(true);
    try {
      await fetchApi(`/api/items/${itemId}`, { method: 'DELETE' });
      showToast('商品を削除しました。', 'success');
      navigate('/');
    } catch (error) {
      showToast(`エラー: ${(error as Error).message}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (loading) { return <div className={styles.centeredMessage}><p>商品を読み込んでいます...</p></div>; }
  if (errorMessage) { return <div className={styles.centeredMessage}><p>ページの読み込みに失敗しました。</p></div>; }
  if (!item) { return <div className={styles.centeredMessage}><p>商品情報が見つかりませんでした。</p></div>; }

  const isOwner = loggedInUserId === item.seller.id;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.itemContainer}>
        <div className={styles.imageSection}>
          {item.imageUrls && item.imageUrls.length > 0 ? (
            item.imageUrls.map((url, index) => (
              <img 
                key={index} 
                src={url} 
                alt={`${item.title} - 画像${index + 1}`} 
                className={styles.mainImage}
              />
            ))
          ) : (
            <div className={styles.noImagePlaceholder}>
              <span>画像はありません</span>
            </div>
          )}
        </div>
        <div className={styles.commentSectionWrapper}>
        <CommentSection itemId={item.id} />
      </div>
        <div className={styles.infoSection}>
          <h1 className={styles.title}>{item.title}</h1>
          <p className={styles.price}>{item.price.toLocaleString()}円</p>
          <div className={styles.description}><p>{item.description}</p></div>
          <div className={styles.sellerInfo}>出品者: <Link to={`/users/${item.seller.id}`}>{item.seller.username}</Link></div>
          
          <div className={styles.buttonContainer}>
            {item.status === 'sold_out' ? (
                <Button disabled={true}>受け渡し完了</Button>
            ) : item.status === 'reserved' ? (
                <Button disabled={true}>予約済み</Button>
            ) : isOwner ? (
                <Button disabled={true}>自分の商品です</Button>
            ) : loggedInUserId ? (
                <Link to={`/items/${item.id}/reserve`} style={{flexGrow: 1, textDecoration: 'none'}}>
                    <Button>この商品を予約する</Button>
                </Link>
            ) : (
                <Button onClick={() => navigate('/login')}>ログインして予約</Button>
            )}
            {/* ★★★ いいねボタンをここに戻します ★★★ */}
            <LikeButton 
                itemId={item.id}
                initialLiked={item.isLikedByCurrentUser}
                initialLikeCount={item.likeCount}
            />
          </div>
          
          {isOwner && (
            <div className={styles.ownerMenu}>
              <h3>出品者メニュー</h3>
              <div className={styles.ownerButtons}>
                <Link to={`/items/${item.id}/edit`}>
                  <button className={styles.editButton}>編集する</button>
                </Link>
                <button onClick={handleDelete} disabled={isProcessing} className={styles.deleteButton}>削除する</button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Link to="/" className={styles.backLink}>商品一覧へ戻る</Link>
    </div>
  );
};