import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './EditItemPage.module.css';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { TextArea } from '../components/TextArea';
import { fetchApi } from '../apiClient';

interface ItemData { title: string; description: string; price: number; status: string; }

export const EditItemPage = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const [itemData, setItemData] = useState<ItemData>({ title: '', description: '', price: 0, status: 'available' });
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const data = await fetchApi(`/api/items/${itemId}`);
        setItemData({ title: data.title, description: data.description, price: data.price, status: data.status });
      } catch (error) { setMessage(error instanceof Error ? error.message : 'エラーが発生しました'); } finally { setLoading(false); }
    };
    fetchItem();
  }, [itemId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setItemData({ ...itemData, [e.target.name]: e.target.value });
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) { setFiles(e.target.files); }
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    let requestBody: FormData | string;
    if (files && files.length > 0) {
      const formData = new FormData();
      formData.append('title', itemData.title);
      formData.append('description', itemData.description);
      formData.append('price', itemData.price.toString());
      formData.append('status', itemData.status);
      for (let i = 0; i < files.length; i++) { formData.append('images', files[i]); }
      requestBody = formData;
    } else {
      requestBody = JSON.stringify(itemData);
    }
    try {
      await fetchApi(`/api/items/${itemId}`, { method: 'PUT', body: requestBody });
      alert('商品情報が更新されました！');
      navigate(`/items/${itemId}`);
    } catch (error) { setMessage(error instanceof Error ? error.message : '予期せぬエラーが発生しました'); } finally { setIsSubmitting(false); }
  };

  if (loading) { return <p>商品情報を読み込んでいます...</p>; }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.formContainer}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px', color: '#4a4a4a' }}>商品情報を編集する</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}><label>商品名</label><Input type="text" name="title" value={itemData.title} onChange={handleChange} required /></div>
          <div className={styles.formGroup}><label>商品説明</label><TextArea name="description" value={itemData.description} onChange={handleChange} rows={5} required /></div>
          <div className={styles.formGroup}><label>価格 (円)</label><Input type="number" name="price" value={itemData.price} onChange={handleChange} required min="0" /></div>
          <div className={styles.formGroup}><label>新しい画像を選択 (差し替える場合)</label><input type="file" id="item-images" className={styles.fileInput} multiple onChange={handleFileChange} /></div>
          <div className={styles.buttonGroup}><Button type="button" onClick={() => navigate(`/items/${itemId}`)} className={styles.cancelButton}>キャンセル</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting ? '更新中...' : '更新する'}</Button></div>
        </form>
        {message && <p className={styles.errorMessage}>{message}</p>}
      </div>
    </div>
  );
};