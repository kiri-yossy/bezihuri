import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ItemCard.module.css';
import { LikeButton } from './LikeButton';

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
      <Link to={`/items/${item.id}`} className={styles.linkWrapper}>
        <div className={styles.imageContainer}>
          {item.imageUrls && item.imageUrls.length > 0 ? (
            <img src={item.imageUrls[0]} alt={item.title} className={styles.image} />
          ) : (
            <div className={styles.noImage}>🥕</div>
          )}
          <div className={styles.priceOverlay}>
            <span>¥{item.price.toLocaleString()}</span>
          </div>
        </div>
        <div className={styles.info}>
          <p className={styles.title}>{item.title}</p>
        </div>
      </Link>
      <div className={styles.likeButtonWrapper}>
        <LikeButton 
          itemId={item.id}
          initialLiked={item.isLikedByCurrentUser}
          initialLikeCount={item.likeCount}
        />
      </div>
    </div>
  );
};