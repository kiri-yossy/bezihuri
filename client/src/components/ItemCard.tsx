import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ItemCard.module.css';
import { LikeButton } from './LikeButton';

// APIからの新しいプロパティに対応
interface Item {
  id: number;
  title: string;
  price: number;
  imageUrls: string[];
  likeCount: number;
  isLikedByCurrentUser: boolean;
}

interface ItemCardProps {
  item: Item;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  return (
    <div className={styles.card}>
      <Link to={`/items/${item.id}`}>
        <div className={styles.imageContainer}>
          {item.imageUrls && item.imageUrls.length > 0 ? (
            <img src={item.imageUrls[0]} alt={item.title} className={styles.image} />
          ) : (
            <div className={styles.noImage}>画像なし</div>
          )}
        </div>
      </Link>
      <div className={styles.info}>
        <h3 className={styles.title}>
          <Link to={`/items/${item.id}`}>{item.title}</Link>
        </h3>
        <div className={styles.bottomRow}>
          <p className={styles.price}>{item.price.toLocaleString()}円</p>
          <LikeButton 
            itemId={item.id}
            initialLiked={item.isLikedByCurrentUser}
            initialLikeCount={item.likeCount}
          />
        </div>
      </div>
    </div>
  );
};