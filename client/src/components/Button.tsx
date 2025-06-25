// /client/src/components/Button.tsx (修正版)

import React from 'react';
import styles from './Button.module.css';

// ボタンが受け取るプロパティの型定義
interface ButtonProps {
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode; // ボタンの中に表示するテキストやアイコン
  disabled?: boolean;
  className?: string; // ★ 外部から追加のクラス名を受け取れるようにする
}

export const Button: React.FC<ButtonProps> = ({ 
  onClick, 
  type = 'button', 
  children, 
  disabled = false, 
  className // ★ propsからclassNameを受け取る
}) => {
  
  // ★ デフォルトのクラス名と、外部から渡されたクラス名を結合する
  const buttonClass = `${styles.commonButton} ${className || ''}`.trim();

  return (
    <button
      className={buttonClass} // ★ 結合したクラス名を適用
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  );
};