// /client/src/apiClient.ts (最終版)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const fetchApi = async (path: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = new Headers();
  if (!(options.body instanceof FormData)) {
    headers.append('Content-Type', 'application/json');
  }
  if (options.headers) {
      const optionHeaders = new Headers(options.headers);
      optionHeaders.forEach((value, key) => {
          headers.append(key, value);
      });
  }
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }
  
  const url = `${API_BASE_URL}${path}`;

  try {
    const response = await fetch(url, { ...options, headers });

    // ★★★ ここから認証エラーのグローバルハンドリングを追加 ★★★
    if (response.status === 401) {
      // トークンが無効、または期限切れの場合
      console.log("Authentication error (401) detected. Logging out.");
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      // ログインページに強制的にリダイレクトし、ページを再読み込みさせる
      window.location.href = '/login'; 
      // このエラーは、呼び出し元のcatchブロックには到達しない
      throw new Error('セッションがタイムアウトしました。再度ログインしてください。');
    }
    // ★★★ ここまで ★★★

    if (response.status === 204) {
      return; 
    }
    
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'APIリクエストに失敗しました。');
    }
    
    return data;

  } catch (error) {
      console.error("API Client Error:", error);
      throw error;
  }
};