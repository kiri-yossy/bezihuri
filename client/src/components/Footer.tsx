import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.logo}>
          🥕 ベジフリ
        </div>
        <div className={styles.links}>
          <Link to="/tutorial" className={styles.link}>使い方ガイド</Link>
          <Link to="/terms" className={styles.link}>利用規約</Link>
          <Link to="/privacy" className={styles.link}>プライバシーポリシー</Link>
        </div>
        <div className={styles.copyright}>
          &copy; {new Date().getFullYear()} VegiFuri. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};