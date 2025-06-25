import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './MyPage.module.css';
import { ItemCard } from '../components/ItemCard';
import { Button } from '../components/Button';
import { fetchApi } from '../apiClient';

interface Item { id: number; title: string; price: number; imageUrls: string[]; likeCount: number; isLikedByCurrentUser: boolean; }
interface UserProfile { username: string; bio: string | null; }
type TabType = 'listed' | 'purchased';

export const MyPage = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [items, setItems] = useState<{ [key in TabType]: Item[] }>({ listed: [], purchased: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('listed');

  useEffect(() => {
    const fetchInitialData = async () => {
        try {
            const [profileData, listedItemsData] = await Promise.all([
              fetchApi('/api/users/me'),
              fetchApi('/api/users/me/items')
            ]);
            setUser(profileData);
            setItems(prev => ({ ...prev, listed: listedItemsData }));
        } catch (err) { setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました。'); } finally { setLoading(false); }
    };
    fetchInitialData();
  }, []);

  const handleTabClick = async (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'purchased' && items.purchased.length === 0) {
      setLoading(true);
      try {
        const purchasedItemsData = await fetchApi('/api/users/me/purchases');
        setItems(prev => ({ ...prev, purchased: purchasedItemsData }));
      } catch (err) { setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました。'); } finally { setLoading(false); }
    }
  };

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
            <button className={activeTab === 'purchased' ? styles.activeTab : styles.tab} onClick={() => handleTabClick('purchased')}>購入した商品</button>
        </div>
        <div className={styles.tabContent}>
            {loading && <p>読み込み中...</p>}
            {!loading && activeTab === 'listed' && (items.listed.length > 0 ? (<div className={styles.itemList}>{items.listed.map(item => (<ItemCard key={item.id} item={item} />))}</div>) : (<p>まだ出品した商品はありません。</p>))}
            {!loading && activeTab === 'purchased' && (items.purchased.length > 0 ? (<div className={styles.itemList}>{items.purchased.map(item => (<ItemCard key={item.id} item={item} />))}</div>) : (<p>まだ購入した商品はありません。</p>))}
        </div>
      </div>
    </div>
  );
};