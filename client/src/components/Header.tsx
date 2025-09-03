import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styles from './Header.module.css';

interface HeaderProps {
  token: string | null;
  handleLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ token, handleLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick = () => { setIsMenuOpen(!isMenuOpen); };
  const handleMobileLinkClick = (path: string) => { navigate(path); };
  const handleMobileLogoutClick = () => { handleLogout(); };
  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const searchQuery = formData.get('searchQuery') as string;
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => { setIsMenuOpen(false); }, [location]);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <Link to="/">🥕 ベジフリ</Link>
        </div>
        <div className={styles.searchContainer}>
          <form onSubmit={handleSearchSubmit}>
            <input name="searchQuery" type="search" placeholder="なにをお探しですか？" className={styles.searchInput} />
          </form>
        </div>
        <nav className={styles.navContainer}>
          {token ? (
            <>
              <Link to="/create-item" className={styles.navLink}>出品</Link>
              <Link to="/conversations" className={styles.navLink}>メッセージ</Link> {/* ★追加 */}
              <Link to="/mypage" className={styles.navLink}>マイページ</Link>
              <button onClick={handleLogout} className={styles.logoutButton}>ログアウト</button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.navLink}>ログイン</Link>
              <Link to="/register" className={styles.navLink}>ユーザー登録</Link>
            </>
          )}
        </nav>
        <button className={styles.hamburgerMenu} onClick={handleMenuClick} aria-label="メニューを開く">
          <div className={styles.hamburgerLine}></div>
          <div className={styles.hamburgerLine}></div>
          <div className={styles.hamburgerLine}></div>
        </button>
      </header>
      <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.menuOpen : ''}`}>
        <nav className={styles.mobileNavLinks}>
          {token ? (
            <>
              <button onClick={() => handleMobileLinkClick('/create-item')} className={styles.mobileNavLink}>出品</button>
              <button onClick={() => handleMobileLinkClick('/conversations')} className={styles.mobileNavLink}>メッセージ</button> {/* ★追加 */}
              <button onClick={() => handleMobileLinkClick('/mypage')} className={styles.mobileNavLink}>マイページ</button>
              <button onClick={handleMobileLogoutClick} className={styles.mobileNavLink}>ログアウト</button>
            </>
          ) : (
            <>
              <button onClick={() => handleMobileLinkClick('/login')} className={styles.mobileNavLink}>ログイン</button>
              <button onClick={() => handleMobileLinkClick('/register')} className={styles.mobileNavLink}>ユーザー登録</button>
            </>
          )}
        </nav>
      </div>
    </>
  );
};