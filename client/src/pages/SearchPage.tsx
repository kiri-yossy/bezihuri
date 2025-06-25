import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import styles from './HomePage.module.css'; // HomePageのレイアウトを流用
import { ItemCard } from '../components/ItemCard';

// 商品の型定義 (共通ファイルからインポートするのが理想)
interface Item {
  id: number;
  title: string;
  price: number;
  imageUrls: string[];
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  seller: {
    id: number;
    username: string;
  };
  likeCount: number; // ← 追加
  isLikedByCurrentUser: boolean; // ← 追加
}

export const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q'); // URLから 'q' パラメータを取得

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // クエリが存在しない場合は何もしない
    if (!query) {
      setItems([]);
      setLoading(false);
      return;
    }

    const fetchSearchResults = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      try {
        const response = await fetch(`/api/items/search?q=${encodeURIComponent(query)}`, { headers }); // ★ headersを追加
        if (!response.ok) {
          throw new Error('検索結果の取得に失敗しました。');
        }
        // ★注意：検索APIはページネーション未対応なので、レスポンスはItem[]です
        const data: Item[] = await response.json();
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました。');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]); // ★検索キーワード(query)が変わるたびに再検索

  if (loading) {
    return <div className={styles.centeredMessage}><p>検索結果を読み込んでいます...</p></div>;
  }
  if (error) {
    return <div className={styles.centeredMessage}><p style={{ color: 'red' }}>エラー: {error}</p></div>;
  }

  return (
    <div className={styles.homePage}>
      <h2>「{query}」の検索結果</h2>
      <hr style={{marginBottom: '24px'}} />

      {items.length > 0 ? (
        <div className={styles.itemListContainer}>
          {items.map(item => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className={styles.centeredMessage}>
          <p>該当する商品が見つかりませんでした。</p>
        </div>
      )}
    </div>
  );
};