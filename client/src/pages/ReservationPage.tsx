// /client/src/pages/ReservationPage.tsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './ReservationPage.module.css'; // ★ CSSファイル名もリネームしたか確認
import { Button } from '../components/Button';
import { useToast } from '../context/ToastContext';
import { fetchApi } from '../apiClient';

interface Item {
  id: number;
  title: string;
  price: number;
  imageUrls: string[];
  status: string;
  seller: { id: number; };
}

export const ReservationPage = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const data = await fetchApi(`/api/items/${itemId}`);
        if (data.status !== 'available' || data.seller.id === Number(localStorage.getItem('userId'))) {
          showToast('この商品は現在予約できません。', 'error');
          navigate('/');
          return;
        }
        setItem(data);
      } catch (error) {
        showToast(error instanceof Error ? error.message : 'エラーが発生しました', 'error');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    if (itemId) fetchItem();
  }, [itemId, navigate, showToast]);

  const handleConfirmReservation = async () => {
    setIsProcessing(true);
    try {
      // ★ 予約APIを呼び出す
      await fetchApi(`/api/items/${itemId}/reserve`, { method: 'POST' });
      showToast('商品の予約が完了しました！', 'success');
      navigate('/mypage'); // 予約後はマイページへ
    } catch (error) {
      showToast(error instanceof Error ? error.message : '予約処理に失敗しました', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) { return <p style={{textAlign: 'center', marginTop: '50px'}}>予約情報を読み込んでいます...</p>; }
  if (!item) { return <p style={{textAlign: 'center', marginTop: '50px'}}>予約対象の商品情報がありません。</p>; }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.purchaseCard}> {/* CSSクラス名はそのまま流用 */}
        <h2>予約内容の確認</h2>
        <div className={styles.itemInfo}>
          {item.imageUrls && item.imageUrls.length > 0 ? (
            <img 
              src={item.imageUrls[0]}
              alt={item.title} 
              className={styles.itemImage} 
            />
          ) : (
            <div className={styles.itemImagePlaceholder}></div>
          )}
          <div className={styles.itemDetails}>
            <p className={styles.itemTitle}>{item.title}</p>
            <p className={styles.itemPrice}>{item.price.toLocaleString()}円</p>
          </div>
        </div>
        <div className={styles.summary}>
          <div className={styles.totalRow}>
            <span>お支払い予定額（現地払い）</span>
            <span>{item.price.toLocaleString()}円</span>
          </div>
        </div>
        <div className={styles.buttonGroup}>
          <Button onClick={() => navigate(`/items/${itemId}`)} className={styles.cancelButton}>キャンセル</Button>
          <Button onClick={handleConfirmReservation} disabled={isProcessing}>
            {isProcessing ? '予約処理中...' : 'この内容で予約する'}
          </Button>
        </div>
      </div>
    </div>
  );
};