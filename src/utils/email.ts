import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

async function createTestAccount() {
  const testAccount = await nodemailer.createTestAccount();
  console.log("****************************************************");
  console.log("* Ethereal - Test Email Account Created            *");
  console.log("****************************************************");
  console.log(`* User: ${testAccount.user}`);
  console.log(`* Pass: ${testAccount.pass}`);
  console.log(`* Mailbox URL: https://ethereal.email/`);
  console.log("****************************************************");
  return testAccount;
}

let transporter: nodemailer.Transporter;

export async function initializeEmail() {
  console.log('[DEBUG] email.ts: Initializing email service...');
  const account = await createTestAccount();

  // プロキシ設定を削除し、シンプルなオプションに戻します
  const transportOptions: SMTPTransport.Options = {
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: {
      user: account.user,
      pass: account.pass,
    },
  };

  transporter = nodemailer.createTransport(transportOptions);
  console.log('[DEBUG] email.ts: Nodemailer transporter created.');
}

export async function sendVerificationEmail(email: string, token: string) {
  console.log('[DEBUG] email.ts: sendVerificationEmail function called.');
  if (!transporter) {
    console.error("[DEBUG] email.ts: Transporter not initialized!");
    throw new Error("Email service is not ready.");
  }

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

  const mailOptions = {
    from: '"ベジフリ" <noreply@vegifuri.example.com>',
    to: email,
    subject: 'ベジフリへようこそ！メールアドレスの認証をお願いします。',
    text: `以下のリンクをクリックして、メールアドレスの認証を完了してください。\n\n${verificationUrl}`,
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
  };

  console.log('[DEBUG] email.ts: Sending mail...');
  const info = await transporter.sendMail(mailOptions);
  console.log('[DEBUG] email.ts: Mail sent. Message ID:', info.messageId);
  console.log('[DEBUG] email.ts: Preview URL:', nodemailer.getTestMessageUrl(info));
}