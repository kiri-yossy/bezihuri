import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './MyPage.module.css';
import { ItemCard } from '../components/ItemCard';
import { Button } from '../components/Button';
import { fetchApi } from '../apiClient';
import { useToast } from '../context/ToastContext';

// 型定義
interface Item {
  id: number;
  title: string;
  price: number;
  imageUrls: string[];
  likeCount: number;
  isLikedByCurrentUser: boolean;
  status?: string;
  reservationId?: number;
  reservationStatus?: string;
  conversationId?: number;
}
interface UserProfile {
    username: string;
    bio: string | null;
}
interface ReservationRequest {
    id: number;
    status: string;
    createdAt: string;
    item: { id: number; title: string; };
    buyer: { id: number; username: string; };
}
type TabType = 'listed' | 'reserved' | 'requests' | 'likes';
type ListedItemFilter = 'all' | 'available' | 'sold';

export const MyPage = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [items, setItems] = useState<{ listed: Item[]; reserved: Item[]; liked: Item[] }>({ listed: [], reserved: [], liked: [] });
  const [requests, setRequests] = useState<ReservationRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('listed');
  const [listedItemFilter, setListedItemFilter] = useState<ListedItemFilter>('all');
  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchDataForTab = async (tab: TabType) => {
    setLoading(true);
    setError(null);
    try {
        let apiUrl = '';
        if (tab === 'listed') apiUrl = '/api/users/me/items';
        else if (tab === 'reserved') apiUrl = '/api/users/me/reservations';
        else if (tab === 'requests') apiUrl = '/api/reservations/requests';
        else if (tab === 'likes') apiUrl = '/api/users/me/likes';

        if (!apiUrl) return;
        const data = await fetchApi(apiUrl);
        if (tab === 'requests') {
            setRequests(data);
        } else {
            setItems(prev => ({ ...prev, [tab]: data }));
        }
    } catch (err) {
        const msg = err instanceof Error ? err.message : 'データの取得に失敗しました。';
        setError(msg);
        showToast(msg, 'error');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [profileData, listedItemsData] = await Promise.all([
              fetchApi('/api/users/me'),
              fetchApi('/api/users/me/items')
            ]);
            setUser(profileData);
            setItems(prev => ({ ...prev, listed: listedItemsData }));
        } catch (err) { setError(err instanceof Error ? err.message : '初期データの取得に失敗しました。'); } finally { setLoading(false); }
    };
    fetchInitialData();
  }, []);

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab);
    const isDataMissing = (tab === 'reserved' && items.reserved.length === 0) ||
                          (tab === 'requests' && requests.length === 0) ||
                          (tab === 'likes' && items.liked.length === 0);
    if (isDataMissing) {
      fetchDataForTab(tab);
    }
  };
  
  const handleReservationAction = async (reservationId: number, action: 'approve' | 'reject') => {
    try {
        await fetchApi(`/api/reservations/${reservationId}/${action}`, { method: 'PUT' });
        showToast(`予約を${action === 'approve' ? '承認' : '拒否'}しました。`, 'success');
        setRequests(prev => prev.filter(req => req.id !== reservationId));
    } catch (err) {
        showToast(err instanceof Error ? err.message : '操作に失敗しました。', 'error');
    }
  };

  const handleCompleteTransaction = async (reservationId: number | undefined) => {
    if (!reservationId) {
        showToast('エラー: 取引情報が見つかりません。', 'error');
        return;
    }
    if (!window.confirm('この取引を「受け渡し完了」にしますか？完了後は評価が可能になります。')) return;
    try {
        await fetchApi(`/api/reservations/${reservationId}/complete`, { method: 'PUT' });
        showToast('取引を完了しました。購入者を評価しましょう。', 'success');
        fetchDataForTab('listed');
        fetchDataForTab('reserved');
    } catch (err) {
        showToast(err instanceof Error ? err.message : '操作に失敗しました。', 'error');
    }
  };

  const filteredListedItems = useMemo(() => {
    if (listedItemFilter === 'all') {
      return items.listed;
    }
    if (listedItemFilter === 'available') {
      return items.listed.filter(item => item.status === 'available');
    }
    if (listedItemFilter === 'sold') {
      return items.listed.filter(item => item.status === 'reserved' || item.status === 'sold_out' || item.status === 'pending_reservation');
    }
    return [];
  }, [items.listed, listedItemFilter]);

  if (loading && !user) { return <p className={styles.centeredMessage}>情報を読み込んでいます...</p>; }
  if (error) { return <p className={styles.centeredMessage} style={{ color: 'red' }}>エラー: {error}</p>; }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.profileSection}>
        <div className={styles.profileIconPlaceholder}></div>
        <h2 className={styles.username}>{user?.username || 'ユーザー名'}</h2>
        <p className={styles.bio}>{user?.bio || '自己紹介文を登録できます。'}</p>
        <Link to="/mypage/edit" style={{ textDecoration: 'none' }}><Button>プロフィールを編集</Button></Link>
      </div>
      <div className={styles.contentSection}>
        <div className={styles.tabNav}>
            <button className={activeTab === 'listed' ? styles.activeTab : styles.tab} onClick={() => handleTabClick('listed')}>出品した商品</button>
            <button className={activeTab === 'reserved' ? styles.activeTab : styles.tab} onClick={() => handleTabClick('reserved')}>予約した商品</button>
            <button className={activeTab === 'requests' ? styles.activeTab : styles.tab} onClick={() => handleTabClick('requests')}>届いた予約リクエスト</button>
            <button className={activeTab === 'likes' ? styles.activeTab : styles.tab} onClick={() => handleTabClick('likes')}>いいね！一覧</button>
        </div>
        <div className={styles.tabContent}>
            {loading && <p>読み込み中...</p>}
            {!loading && activeTab === 'listed' && (
                <div>
                    <div className={styles.filterContainer}>
                        <button onClick={() => setListedItemFilter('all')} className={listedItemFilter === 'all' ? styles.activeFilter : ''}>すべて</button>
                        <button onClick={() => setListedItemFilter('available')} className={listedItemFilter === 'available' ? styles.activeFilter : ''}>販売中</button>
                        <button onClick={() => setListedItemFilter('sold')} className={listedItemFilter === 'sold' ? styles.activeFilter : ''}>予約中・売り切れ</button>
                    </div>
                    {filteredListedItems.length > 0 ? (
                        <div className={styles.itemList}>{filteredListedItems.map(item => (<div key={item.id} className={styles.transactionItem}><ItemCard item={item} /><div className={styles.transactionActions}>{item.status === 'reserved' && <Button onClick={() => handleCompleteTransaction(item.reservationId)}>受け渡し完了にする</Button>}{item.status === 'sold_out' && <Button disabled>評価待ち</Button>}</div></div>))}</div>
                    ) : (<div className={styles.emptyState}><p>該当する商品はありません。</p></div>)}
                </div>
            )}
            {!loading && activeTab === 'reserved' && (
                items.reserved.length > 0 ? (
                    <div className={styles.itemList}>{items.reserved.map(item => (<div key={item.id} className={styles.transactionItem}><ItemCard item={item} /><div className={styles.transactionActions}>{item.reservationStatus === 'reserved' && item.conversationId && (<Button onClick={() => navigate(`/chat/${item.conversationId}`)}>出品者と連絡</Button>)}{item.reservationStatus === 'completed' && (<Link to={`/reservations/${item.reservationId}/review`}><Button className={styles.reviewButton}>出品者を評価する</Button></Link>)}</div></div>))}</div>
                ) : (<div className={styles.emptyState}><p>まだ予約した商品はありません。</p></div>)
            )}
            {!loading && activeTab === 'requests' && (
                requests.length > 0 ? (
                    <div className={styles.requestList}>{requests.map(req => (<div key={req.id} className={styles.requestItem}><div className={styles.requestInfo}><p><strong>購入希望者:</strong> {req.buyer.username}</p><p><strong>商品:</strong> {req.item.title}</p><p><strong>リクエスト日時:</strong> {new Date(req.createdAt).toLocaleString('ja-JP')}</p></div><div className={styles.requestActions}><button onClick={() => handleReservationAction(req.id, 'approve')} className={styles.approveButton}>承認する</button><button onClick={() => handleReservationAction(req.id, 'reject')} className={styles.rejectButton}>拒否する</button></div></div>))}</div>
                ) : (<div className={styles.emptyState}><p>現在、新しい予約リクエストはありません。</p></div>)
            )}
            {!loading && activeTab === 'likes' && (
                items.liked.length > 0 ? (
                    <div className={styles.itemList}>{items.liked.map(item => (<ItemCard key={item.id} item={item} />))}</div>
                ) : (<div className={styles.emptyState}><p>まだ「いいね！」した商品はありません。</p><Link to="/" style={{textDecoration: 'none'}}><Button>商品を探しに行く</Button></Link></div>)
            )}
        </div>
      </div>
    </div>
  );
};