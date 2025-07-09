// /src/utils/email.ts (Resend版)

import { Resend } from 'resend';

// Resendのクライアントを初期化
const resend = new Resend(process.env.RESEND_API_KEY);

// ★★★ サーバー起動時のinitializeEmail()はもう不要です ★★★
// export async function initializeEmail() { ... } の関数全体を削除してもOKです。

// メールを送信する本体の関数
export async function sendVerificationEmail(email: string, token: string) {
  // フロントエンドの認証ページのURLを構築
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'ベジフリ運営 <onboarding@resend.dev>', // ★ Resendのテスト用送信元アドレス
      to: [email], // 宛先
      subject: 'ベジフリへようこそ！メールアドレスの認証をお願いします。',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2>ベジフリにご登録いただきありがとうございます！</h2>
          <p>以下のボタンをクリックして、メールアドレスの認証を完了してください。</p>
          <a 
            href="${verificationUrl}" 
            style="display: inline-block; padding: 12px 24px; margin: 20px 0; font-size: 16px; color: #fff; background-color: #2ecc71; text-decoration: none; border-radius: 5px;"
          >
            メールアドレスを認証する
          </a>
          <p>もしボタンがクリックできない場合は、以下のURLをブラウザにコピー＆ペーストしてください。</p>
          <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        </div>
      `,
    });

    if (error) {
      // もしResend側でエラーがあれば、それをスローする
      console.error('Error sending email with Resend:', error);
      throw error;
    }

    console.log(`Verification email sent to ${email} via Resend. ID: ${data?.id}`);
  } catch (error) {
    console.error('Failed to send verification email:', error);
    // エラーを再スローして、呼び出し元で処理できるようにする
    throw error;
  }
}