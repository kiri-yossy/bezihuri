import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import styles from './App.module.css';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ToastProvider, useToast } from './context/ToastContext';
import { HomePage } from './pages/HomePage';
import { ItemDetailPage } from './pages/ItemDetailPage';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { CreateItemPage } from './pages/CreateItemPage';
import { EditItemPage } from './pages/EditItemPage';
import { MyPage } from './pages/MyPage';
import { SearchPage } from './pages/SearchPage';
import { ProfileEditPage } from './pages/ProfileEditPage';
import { ReservationPage } from './pages/ReservationPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { CheckEmailPage } from './pages/CheckEmailPage';
import { ReviewPage } from './pages/ReviewPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { TermsPage } from './pages/TermsPage'; // ★ 新しいページをインポート
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage'; // ★ 新しいページをインポート

// ★★★ ファイル内で定義していた仮のページは削除します ★★★
// const TermsPage = () => ...
// const PrivacyPolicyPage = () => ...

function AppContent() {
  const [token, setToken] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_loggedInUserId, setLoggedInUserId] = useState<number | null>(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    if (storedToken && storedUserId) {
      setToken(storedToken);
      setLoggedInUserId(parseInt(storedUserId, 10));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setToken(null);
    setLoggedInUserId(null);
    showToast('ログアウトしました。', 'success');
    navigate('/');
  };

  const handleLoginSuccess = (newToken: string, userId: number) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('userId', userId.toString());
    setToken(newToken);
    setLoggedInUserId(userId);
    showToast('ログインに成功しました！', 'success');
    navigate('/');
  };

  const handleRegisterSuccess = () => {
    if (import.meta.env.VITE_EMAIL_VERIFICATION_ENABLED === 'true') {
      navigate('/check-email');
    } else {
      showToast('ユーザー登録が成功しました！ログインしてください。', 'success');
      navigate('/login');
    }
  };

  const handleItemCreated = async () => {
    showToast('商品が正常に出品されました！', 'success');
    navigate('/');
  };

  return (
    <div className={styles.appContainer}>
      <Header token={token} handleLogout={handleLogout} />
      <main className={styles.mainContent}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/items/:itemId" element={<ItemDetailPage />} />
          <Route path="/items/:itemId/edit" element={token ? <EditItemPage /> : <LoginPage onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/items/:itemId/reserve" element={token ? <ReservationPage /> : <LoginPage onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/register" element={<RegisterPage onRegisterSuccess={handleRegisterSuccess} />} />
          <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/create-item" element={token ? <CreateItemPage onItemCreated={handleItemCreated} /> : <LoginPage onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/mypage" element={token ? <MyPage /> : <LoginPage onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/mypage/edit" element={token ? <ProfileEditPage /> : <LoginPage onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/reservations/:reservationId/review" element={token ? <ReviewPage /> : <LoginPage onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/users/:userId" element={<UserProfilePage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/check-email" element={<CheckEmailPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;