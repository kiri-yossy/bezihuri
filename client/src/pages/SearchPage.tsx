import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import styles from './HomePage.module.css';
import { ItemCard } from '../components/ItemCard';
import { fetchApi } from '../apiClient';
import { Button } from '../components/Button';

// 型定義
interface Item {
  id: number;
  title: string;
  price: number;
  imageUrls: string[];
  likeCount: number;
  isLikedByCurrentUser: boolean;
}
interface SearchApiResponse {
    items: Item[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
}

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q');
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [apiResponse, setApiResponse] = useState<SearchApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) {
      setApiResponse({ items: [], totalItems: 0, totalPages: 0, currentPage: 1 });
      setLoading(false);
      return;
    }

    const fetchSearchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchApi(`/api/items/search?q=${encodeURIComponent(query)}&page=${page}`);
        setApiResponse(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '検索結果の取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, page]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && apiResponse && newPage <= apiResponse.totalPages) {
        setSearchParams({ q: query || '', page: newPage.toString() });
        window.scrollTo(0, 0);
    }
  };

  if (loading) {
    return <div className={styles.centeredMessage}><p>検索結果を読み込んでいます...</p></div>;
  }
  if (error) {
    return <div className={styles.centeredMessage}><p style={{ color: 'red' }}>エラー: {error}</p></div>;
  }

  return (
    <div className={styles.homePage}>
      <h2>「{query}」の検索結果</h2>
      <p>{apiResponse?.totalItems || 0}件の商品が見つかりました</p>
      <hr style={{marginBottom: '24px'}} />

      {apiResponse && apiResponse.items.length > 0 ? (
        <>
          <div className={styles.itemListContainer}>
            {apiResponse.items.map(item => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>

          {apiResponse.totalPages > 1 && (
            <div className={styles.pagination}>
              <button 
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
              >
                前へ
              </button>
              <span>
                ページ {apiResponse.currentPage} / {apiResponse.totalPages}
              </span>
              <button 
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= apiResponse.totalPages}
              >
                次へ
              </button>
            </div>
          )}
        </>
      ) : (
        <div className={styles.centeredMessage}>
          <p>該当する商品が見つかりませんでした。</p>
          <Link to="/" style={{textDecoration: 'none'}}><Button>トップページに戻る</Button></Link>
        </div>
      )}
    </div>
  );
};