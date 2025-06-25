import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import styles from './HomePage.module.css';
import { ItemCard } from '../components/ItemCard';
import { fetchApi } from '../apiClient';

interface Item { id: number; title: string; price: number; imageUrls: string[]; likeCount: number; isLikedByCurrentUser: boolean; }

export const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) {
      setItems([]);
      setLoading(false);
      return;
    }
    const fetchSearchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchApi(`/api/items/search?q=${encodeURIComponent(query)}`);
        setItems(data);
      } catch (err) { setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました。'); } finally { setLoading(false); }
    };
    fetchSearchResults();
  }, [query]);

  if (loading) { return <p>検索結果を読み込んでいます...</p>; }
  if (error) { return <p style={{ color: 'red' }}>エラー: {error}</p>; }

  return (
    <div className={styles.homePage}>
      <h2>「{query}」の検索結果</h2>
      <hr style={{marginBottom: '24px'}} />
      {items.length > 0 ? (<div className={styles.itemListContainer}>{items.map(item => (<ItemCard key={item.id} item={item} />))}</div>) : (<div className={styles.centeredMessage}><p>該当する商品が見つかりませんでした。</p></div>)}
    </div>
  );
};