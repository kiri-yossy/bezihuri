// /client/src/apiClient.ts (修正版)

// Vercelに設定した環境変数からAPIのベースURLを取得
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * 汎用的なAPIフェッチ関数
 * @param path APIのエンドポイントパス (例: '/api/items')
 * @param options fetchに渡すオプション (method, bodyなど)
 */
export const fetchApi = async (path: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  // ★★★ Headersオブジェクトを使ってヘッダーを構築 ★★★
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');

  // もしオプションで渡されたヘッダーがあれば追加
  if (options.headers) {
      const optionHeaders = new Headers(options.headers);
      optionHeaders.forEach((value, key) => {
          headers.append(key, value);
      });
  }

  // トークンがあればAuthorizationヘッダーを追加
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }
  
  // ファイルアップロード（FormData）の場合、Content-Typeはブラウザに任せるので削除
  if (options.body instanceof FormData) {
      headers.delete('Content-Type');
  }
  // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★

  const url = `${API_BASE_URL}${path}`;
  console.log(`[API Call] ${options.method || 'GET'}: ${url}`);

  try {
    const response = await fetch(url, {
      ...options,
      headers, // ★構築したHeadersオブジェクトを渡す
    });

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