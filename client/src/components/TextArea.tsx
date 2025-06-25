import React from 'react';
import styles from './TextArea.module.css';


export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => {
  return (
    <textarea
      className={styles.commonTextArea}
      {...props} // value, onChangeなどをそのまま渡す
    />
  );
};