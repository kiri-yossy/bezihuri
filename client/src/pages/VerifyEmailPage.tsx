// /client/src/pages/VerifyEmailPage.tsx

import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchApi } from '../apiClient';

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // URLから ?token=... の値を取得

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('メールアドレスを認証しています...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('認証トークンが見つかりません。');
      return;
    }

    const verifyToken = async () => {
      try {
        const data = await fetchApi('/api/auth/verify-email', {
          method: 'POST',
          body: JSON.stringify({ token }),
        });
        setStatus('success');
        setMessage(data.message);
      } catch (error) {
        setStatus('error');
        setMessage(error instanceof Error ? error.message : '認証に失敗しました。');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      {status === 'verifying' && <h2>認証中...</h2>}
      {status === 'success' && <h2 style={{ color: '#2ecc71' }}>✅ 認証完了</h2>}
      {status === 'error' && <h2 style={{ color: '#e74c3c' }}>❌ 認証失敗</h2>}
      
      <p style={{ marginTop: '20px' }}>{message}</p>

      {status !== 'verifying' && (
        <div style={{ marginTop: '30px' }}>
          <Link to="/login">
            <button>ログインページへ</button>
          </Link>
        </div>
      )}
    </div>
  );
};