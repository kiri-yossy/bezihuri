import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './PurchasePage.module.css';
import { Button } from '../components/Button';
import { useToast } from '../context/ToastContext';
import { fetchApi } from '../apiClient';

interface Item { id: number; title: string; price: number; imageUrls: string[]; status: string; seller: { id: number; }; }

export const PurchasePage = () => {
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
          showToast('この商品は購入できません。', 'error');
          navigate('/');
          return;
        }
        setItem(data);
      } catch (error) { showToast(error instanceof Error ? error.message : 'エラーが発生しました', 'error'); navigate('/'); } finally { setLoading(false); }
    };
    if (itemId) fetchItem();
  }, [itemId, navigate, showToast]);

  const handleConfirmPurchase = async () => {
    setIsProcessing(true);
    try {
      await fetchApi('/api/orders', { method: 'POST', body: JSON.stringify({ itemId: item?.id }) });
      showToast('商品の購入が完了しました！', 'success');
      navigate('/mypage');
    } catch (error) { showToast(error instanceof Error ? error.message : 'エラーが発生しました', 'error'); } finally { setIsProcessing(false); }
  };

  if (loading) { return <p style={{textAlign: 'center', marginTop: '50px'}}>購入情報を読み込んでいます...</p>; }
  if (!item) { return <p style={{textAlign: 'center', marginTop: '50px'}}>購入対象の商品情報がありません。</p>; }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.purchaseCard}>
        <h2>購入内容の確認</h2>
        <div className={styles.itemInfo}>
          <img src={item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : ''} alt={item.title} className={styles.itemImage} />
          <div className={styles.itemDetails}><p className={styles.itemTitle}>{item.title}</p><p className={styles.itemPrice}>{item.price.toLocaleString()}円</p></div>
        </div>
        <div className={styles.summary}><div className={styles.totalRow}><span>お支払い合計</span><span>{item.price.toLocaleString()}円</span></div></div>
        <div className={styles.buttonGroup}><Button onClick={() => navigate(`/items/${itemId}`)} className={styles.cancelButton}>キャンセル</Button><Button onClick={handleConfirmPurchase} disabled={isProcessing}>{isProcessing ? '処理中...' : '購入を確定する'}</Button></div>
      </div>
    </div>
  );
};