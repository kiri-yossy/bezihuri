import React from 'react';
import styles from './Input.module.css';

// interface InputProps ... の行を完全に削除

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => {
  return (
    <input
      className={styles.commonInput}
      {...props}
    />
  );
};