import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styles from './MyPage.module.css';
import { ItemCard } from '../components/ItemCard';
import { Button } from '../components/Button';

// 商品の型定義 (共通化が理想)
interface Item {
  id: number;
  title: string;
  price: number;
  imageUrls: string[];
  likeCount: number;
  isLikedByCurrentUser: boolean;
}

// ユーザープロフィールの型定義
interface UserProfile {
    id: number;
    username: string;
    bio: string | null;
}

type TabType = 'listed' | 'purchased';

export const MyPage = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [items, setItems] = useState<{ [key in TabType]: Item[] }>({ listed: [], purchased: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('listed');

  const fetchData = useCallback(async (tab: TabType) => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    if (!token) {
      setError("ログインしていません。");
      setLoading(false);
      return;
    }

    try {
      let apiUrl = '';
      if (tab === 'listed') {
        apiUrl = '/api/users/me/items';
      } else {
        apiUrl = '/api/users/me/purchases';
      }

      const response = await fetch(apiUrl, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!response.ok) throw new Error(`${tab === 'listed' ? '出品' : '購入'}した商品の取得に失敗しました。`);
      
      const itemsData = await response.json();
      setItems(prev => ({ ...prev, [tab]: itemsData }));

    } catch (err) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    // 初回ロードでプロフィールと出品商品を取得
    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [profileResponse, listedItemsResponse] = await Promise.all([
              fetch('/api/users/me', { headers: { 'Authorization': `Bearer ${token}` } }),
              fetch('/api/users/me/items', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
    
            if (!profileResponse.ok) throw new Error('プロフィール情報の取得に失敗しました。');
            if (!listedItemsResponse.ok) throw new Error('出品した商品の取得に失敗しました。');
    
            const profileData = await profileResponse.json();
            const listedItemsData = await listedItemsResponse.json();
    
            setUser(profileData);
            setItems(prev => ({ ...prev, listed: listedItemsData }));
        } catch (err) {
            setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました。');
        } finally {
            setLoading(false);
        }
    };
    
    fetchInitialData();
  }, []);

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab);
    // 「購入済み」タブのデータがまだ読み込まれていない場合のみフェッチする
    if (tab === 'purchased' && items.purchased.length === 0) {
      fetchData(tab);
    }
  };

  if (loading && !user) { // 初回データロード中
    return <p className={styles.centeredMessage}>情報を読み込んでいます...</p>;
  }

  if (error) {
    return <p className={styles.centeredMessage} style={{ color: 'red' }}>エラー: {error}</p>;
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.profileSection}>
        <div className={styles.profileIconPlaceholder}></div>
        <h2 className={styles.username}>{user?.username || 'ユーザー名'}</h2>
        <p className={styles.bio}>{user?.bio || '自己紹介文を登録できます。'}</p>
        <Link to="/mypage/edit" style={{ textDecoration: 'none' }}>
            <Button>プロフィールを編集</Button>
        </Link>
      </div>

      <div className={styles.contentSection}>
        <div className={styles.tabNav}>
            <button
                className={activeTab === 'listed' ? styles.activeTab : styles.tab}
                onClick={() => handleTabClick('listed')}
            >
                出品した商品
            </button>
            <button
                className={activeTab === 'purchased' ? styles.activeTab : styles.tab}
                onClick={() => handleTabClick('purchased')}
            >
                購入した商品
            </button>
        </div>

        <div className={styles.tabContent}>
            {loading && <p>読み込み中...</p>}
            {!loading && activeTab === 'listed' && (
                items.listed.length > 0 ? (
                    <div className={styles.itemList}>
                        {items.listed.map(item => (
                        <ItemCard key={item.id} item={item} />
                        ))}
                    </div>
                ) : (
                    <p>まだ出品した商品はありません。</p>
                )
            )}
            {!loading && activeTab === 'purchased' && (
                items.purchased.length > 0 ? (
                    <div className={styles.itemList}>
                        {items.purchased.map(item => (
                        <ItemCard key={item.id} item={item} />
                        ))}
                    </div>
                ) : (
                    <p>まだ購入した商品はありません。</p>
                )
            )}
        </div>
      </div>
    </div>
  );
};