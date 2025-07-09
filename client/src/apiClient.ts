// /client/src/apiClient.ts

// Vercelに設定した環境変数からAPIのベースURLを取得します。
// ローカル開発環境ではこの変数は存在しないため、空文字列 '' を使います。
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * 汎用的なAPIフェッチ関数
 * @param path APIのエンドポイントパス (例: '/api/items')
 * @param options fetchに渡すオプション (method, bodyなど)
 */
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
  console.log(`[API Call] ${options.method || 'GET'}: ${url}`);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
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
