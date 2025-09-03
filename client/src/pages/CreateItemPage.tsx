import React, { useState } from 'react';
import styles from './CreateItemPage.module.css';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { TextArea } from '../components/TextArea';
import { fetchApi } from '../apiClient';

interface CreateItemPageProps {
  onItemCreated: () => Promise<void>;
}

const categories = ["野菜", "果物", "その他"];

export const CreateItemPage: React.FC<CreateItemPageProps> = ({ onItemCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [files, setFiles] = useState<FileList | null>(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) { setFiles(event.target.files); }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('category', category);
    if (files) { for (let i = 0; i < files.length; i++) { formData.append('images', files[i]); } }

    try {
      await fetchApi('/api/items', { method: 'POST', body: formData });
      await onItemCreated();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '予期せぬエラーが発生しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.createItemPageContainer}>
      <div className={styles.formContainer}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px', color: '#4a4a4a' }}>商品を出品する</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}><Input type="text" placeholder="商品名" value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
          <div className={styles.formGroup}><label>カテゴリー</label><select value={category} onChange={(e) => setCategory(e.target.value)} className={styles.selectInput}>{categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}</select></div>
          <div className={styles.formGroup}><TextArea placeholder="商品の説明" rows={6} value={description} onChange={(e) => setDescription(e.target.value)} required /></div>
          <div className={styles.formGroup}><Input type="number" placeholder="価格 (円)" value={price} onChange={(e) => setPrice(e.target.value)} required min="0" /></div>
          <div className={styles.formGroup}><label>商品画像 (複数選択可)</label><input type="file" id="item-images" className={styles.fileInput} multiple onChange={handleFileChange} /></div>
          <div className={styles.formGroup}><Button type="submit" disabled={isSubmitting}>{isSubmitting ? '出品中...' : '出品する'}</Button></div>
        </form>
        {message && <p className={styles.errorMessage}>{message}</p>}
      </div>
    </div>
  );
};