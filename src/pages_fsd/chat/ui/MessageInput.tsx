'use client';

import React, { useEffect, useRef, useState } from 'react';
import style from './MessageInput.module.scss';
import EmojiPicker from './EmojiPicker';

interface MessageInputProps {
  onSend: (text: string) => void;
  onRefresh?: () => void;
  disabled?: boolean;
  refreshing?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSend, onRefresh, disabled, refreshing }) => {
  const [text, setText] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!pickerOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [pickerOpen]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  }, [text]);

  const send = () => {
    const value = text.trim();
    if (!value || disabled) return;
    onSend(value);
    setText('');
    setPickerOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setText(prev => prev + emoji);
    textareaRef.current?.focus();
  };

  return (
    <div className={style.inputBar} ref={wrapperRef}>
      <button
        type="button"
        className={style.emojiButton}
        onClick={() => setPickerOpen(open => !open)}
        aria-label="Эмодзи"
      >
        <span aria-hidden="true">😊</span>
      </button>
      {onRefresh && (
        <button
          type="button"
          className={`${style.refreshButton} ${refreshing ? style.refreshButtonSpin : ''}`}
          onClick={onRefresh}
          disabled={refreshing}
          aria-label="Обновить чат"
        >
          <span aria-hidden="true">↻</span>
        </button>
      )}
      <textarea
        ref={textareaRef}
        className={style.input}
        placeholder="Напишите сообщение..."
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        disabled={disabled}
      />
      <button
        type="button"
        className={style.sendButton}
        onClick={send}
        disabled={!text.trim() || disabled}
        aria-label="Отправить сообщение"
      >
        <span aria-hidden="true">➤</span>
      </button>
      {pickerOpen && <EmojiPicker onSelect={handleEmojiSelect} />}
    </div>
  );
};

export default MessageInput;
