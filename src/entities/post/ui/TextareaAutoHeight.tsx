'use client';
import style from './TextArea.module.scss';
import { useEffect, useRef } from 'react';

interface TextareaAutoHeightProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  maxHeight?: number;
  [key: string]: any;
}

const TextareaAutoHeight: React.FC<TextareaAutoHeightProps> = ({
  value,
  onChange,
  maxHeight = 300,
  ...props
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.height = `${newHeight}px`;
      textarea.style.overflowY = newHeight >= maxHeight ? 'auto' : 'hidden';
    }
  }, [value, maxHeight]);

  const valueName = value.split(' ').find((el: string) => el.startsWith('@'));
  const editedValue = valueName ? value.replace(valueName, '') : value;

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      className={style.autoHeightTextarea}
      {...props}
    >
      <span className={style.nickName}>{valueName}</span>
      {editedValue}
    </textarea>
  );
};

export default TextareaAutoHeight;
