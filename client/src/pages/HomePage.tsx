import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './HomePage.module.css';
import { ItemCard } from '../components/ItemCard';
import { fetchApi } from '../apiClient';

// 型定義
interface Item {
  id: number;
  title: string;
  price: number;
  imageUrls: string[];
  likeCount: number;
  isLikedByCurrentUser: boolean;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  seller: {
    id: number;
    username: string;
  };
}

interface ItemsApiResponse {
    items: Item[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
}

const categories = ["野菜", "果物", "その他"];
type ItemStatusFilter = 'all' | 'available' | 'reserved' | 'sold_out';

export const HomePage = () => {
  const [apiResponse, setApiResponse] = useState<ItemsApiResponse | null>(null);
  const [loadingItems, setLoadingItems] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'new' | 'category'>('new');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemStatusFilter, setItemStatusFilter] = useState<ItemStatusFilter>('available');
  const location = useLocation();

  useEffect(() => {
    const fetchItems = async (page: number) => {
      setLoadingItems(true);
      setErrorMessage(null);
      try {
        let apiUrl = `/api/items?page=${page}&limit=9&filter=${itemStatusFilter}`;
        if (activeTab === 'category' && selectedCategory) {
          apiUrl = `/api/items/category/${selectedCategory}?page=${page}&limit=9`;
        }
        
        const data = await fetchApi(apiUrl);
        setApiResponse(data);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : '予期せぬエラーが発生しました。');
      } finally {
        setLoadingItems(false);
      }
    };

    fetchItems(currentPage);
  }, [currentPage, activeTab, selectedCategory, itemStatusFilter, location.key]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && apiResponse && newPage <= apiResponse.totalPages) {
        setCurrentPage(newPage);
        window.scrollTo(0, 0);
    }
  };

  const handleTabClick = (tab: 'new' | 'category') => {
    setActiveTab(tab);
    setSelectedCategory(null);
    setCurrentPage(1);
    setItemStatusFilter('all'); // タブ切り替え時にフィルターもリセット
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleFilterChange = (filter: ItemStatusFilter) => {
    setItemStatusFilter(filter);
    setCurrentPage(1);
  };

  if (loadingItems) {
    return <div className={styles.centeredMessage}><p>商品を読み込んでいます...</p></div>;
  }
  if (errorMessage) {
    return <div className={styles.centeredMessage}><p style={{ color: 'red' }}>エラー: {errorMessage}</p></div>;
  }

  return (
    <div className={styles.homePage}>
      <div className={styles.tabNav}>
        <button
          className={activeTab === 'new' ? styles.activeTab : styles.tab}
          onClick={() => handleTabClick('new')}
        >
          新着商品
        </button>
        <button
          className={activeTab === 'category' ? styles.activeTab : styles.tab}
          onClick={() => handleTabClick('category')}
        >
          カテゴリ
        </button>
      </div>
      
      {activeTab === 'new' && (
        <div className={styles.filterContainer}>
            <button onClick={() => handleFilterChange('all')} className={itemStatusFilter === 'all' ? styles.activeFilter : ''}>すべて</button>
            <button onClick={() => handleFilterChange('available')} className={itemStatusFilter === 'available' ? styles.activeFilter : ''}>販売中</button>
            <button onClick={() => handleFilterChange('reserved')} className={itemStatusFilter === 'reserved' ? styles.activeFilter : ''}>予約中</button>
        </div>
      )}

      {activeTab === 'new' && (
        apiResponse && apiResponse.items.length > 0 ? (
          <>
            <div className={styles.itemListContainer}>
              {apiResponse.items.map(item => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
            {apiResponse.totalPages > 1 && (
              <div className={styles.pagination}>
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1}>前へ</button>
                <span>ページ {apiResponse.currentPage} / {apiResponse.totalPages}</span>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= apiResponse.totalPages}>次へ</button>
              </div>
            )}
          </>
        ) : (
          <div className={styles.centeredMessage}><p>該当する商品はありません。</p></div>
        )
      )}
      {activeTab === 'category' && (
        <div className={styles.categoryContainer}>
          {!selectedCategory ? (
            <div className={styles.categoryList}>
              <h3>カテゴリーを選択してください</h3>
              {categories.map(cat => (
                <button 
                  key={cat} 
                  className={styles.categoryButton}
                  onClick={() => handleCategoryClick(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          ) : (
            <div>
              <h3>「{selectedCategory}」の商品</h3>
              {apiResponse && apiResponse.items.length > 0 ? (
                <>
                  <div className={styles.itemListContainer}>
                    {apiResponse.items.map(item => (
                      <ItemCard key={item.id} item={item} />
                    ))}
                  </div>
                  {apiResponse.totalPages > 1 && (
                    <div className={styles.pagination}>
                      <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1}>前へ</button>
                      <span>ページ {apiResponse.currentPage} / {apiResponse.totalPages}</span>
                      <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= apiResponse.totalPages}>次へ</button>
                    </div>
                  )}
                </>
              ) : (
                <p>このカテゴリーに出品されている商品はありません。</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};