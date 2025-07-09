import { Link } from 'react-router-dom';
import styles from './CheckEmailPage.module.css'; // ★このCSSファイルも後で作成します
import { Button } from '../components/Button';

export const CheckEmailPage = () => {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>
        <div className={styles.icon}>✉️</div>
        <h2>ご登録ありがとうございます！</h2>
        <p>
          ご入力いただいたメールアドレス宛に、認証用のメールを送信しました。
          <br />
          メールに記載されているリンクをクリックして、登録を完了してください。
        </p>
        <div className={styles.buttonWrapper}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Button>トップページへ戻る</Button>
          </Link>
        </div>
        <p className={styles.note}>
          メールが届かない場合は、迷惑メールフォルダもご確認ください。
        </p>
      </div>
    </div>
  );
};