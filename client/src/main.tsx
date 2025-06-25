import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css' // もしあれば
import { BrowserRouter } from 'react-router-dom'; // ★BrowserRouterをインポート

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter> {/* ★AppコンポーネントをBrowserRouterで囲む */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)