import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './BackButton.module.css';

export const BackButton = () => {
  const navigate = useNavigate();

  // ブラウザの履歴を一つ前に戻る関数
  const goBack = () => {
    navigate(-1);
  };

  return (
    <button onClick={goBack} className={styles.backButton} aria-label="前のページに戻る">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </button>
  );
};