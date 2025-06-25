import React, { createContext, useState, useContext, useCallback, type ReactNode } from 'react';
import styles from './Toast.module.css'; // ★作成したCSSモジュールをインポート

// 通知の見た目（成功 or エラー）
type ToastType = 'success' | 'error';

// Contextが提供する値の型定義
interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// 他のコンポーネントで簡単にContextを呼び出すためのカスタムフック
// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// 子コンポーネントにContextの機能を提供するプロバイダーコンポーネント
export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<{ message: string; type: ToastType; id: number } | null>(null);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = new Date().getTime(); 
    setToast({ message, type, id });

    // 4秒後に通知を自動的に消す
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && <Toast message={toast.message} type={toast.type} key={toast.id} />}
    </ToastContext.Provider>
  );
};

// ★★★ 通知本体のUIコンポーネント ★★★
interface ToastProps {
  message: string;
  type: ToastType;
}

// このコンポーネントはファイル内でしか使わないのでexportは不要
const Toast: React.FC<ToastProps> = ({ message, type }) => {
  // ★ classNameにCSSモジュールのクラスを適用
  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      {message}
    </div>
  );
};