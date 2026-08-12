'use client';

import React, { useRef } from 'react';
import EditorToolbar, { type ToolbarItem } from './EditorToolbar';
import { promptSafeUrl } from '../lib/safeUrl';
import style from './MdEditor.module.scss';

interface MarkdownModeProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Режим «Разметка»: слева текст статьи с панелью форматирования, справа —
 * превью тем же компонентом, что рисует статью на сайте (превью живёт в
 * MdEditor, чтобы не перерисовывать его при каждом переключении режима).
 */
const MarkdownMode: React.FC<MarkdownModeProps> = ({ value, onChange }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyChange = (element: HTMLTextAreaElement) => {
    onChange(element.value);
    element.focus();
  };

  /** Обернуть выделение или вставить пустую заготовку под курсором. */
  const surround = (before: string, after: string) => {
    const element = textareaRef.current;
    if (!element) return;
    const { selectionStart: start, selectionEnd: end } = element;
    const selected = element.value.slice(start, end);
    element.setRangeText(before + selected + after, start, end, 'end');
    if (!selected) {
      const caret = start + before.length;
      element.setSelectionRange(caret, caret);
    }
    applyChange(element);
  };

  /** Поставить префикс каждой строке выделения (заголовки, списки, цитата). */
  const prefixLines = (prefix: string) => {
    const element = textareaRef.current;
    if (!element) return;
    const { selectionStart: start, selectionEnd: end } = element;
    const lineStart = element.value.lastIndexOf('\n', start - 1) + 1;
    const block = element.value.slice(lineStart, end);
    const updated = block
      .split('\n')
      .map((line, index) => {
        const cleaned = line.replace(/^([-*+]|\d+\.|>|#{1,6})\s*/, '');
        return `${prefix === '1. ' ? `${index + 1}. ` : prefix}${cleaned}`;
      })
      .join('\n');
    element.setRangeText(updated, lineStart, Math.max(end, lineStart), 'end');
    applyChange(element);
  };

  const insertBlock = (text: string) => {
    const element = textareaRef.current;
    if (!element) return;
    const position = element.selectionEnd;
    const separator = element.value.slice(0, position).endsWith('\n') ? '' : '\n\n';
    element.setRangeText(`${separator}${text}\n`, position, position, 'end');
    applyChange(element);
  };

  const groups: ToolbarItem[][] = [
    [
      { key: 'h1', title: 'Заголовок 1', label: 'H1', onClick: () => prefixLines('# ') },
      { key: 'h2', title: 'Заголовок 2', label: 'H2', onClick: () => prefixLines('## ') },
      { key: 'h3', title: 'Заголовок 3', label: 'H3', onClick: () => prefixLines('### ') },
    ],
    [
      {
        key: 'bold',
        title: 'Жирный (Ctrl+B)',
        label: <b>Ж</b>,
        onClick: () => surround('**', '**'),
      },
      {
        key: 'italic',
        title: 'Курсив (Ctrl+I)',
        label: <i>К</i>,
        onClick: () => surround('*', '*'),
      },
      { key: 'strike', title: 'Зачёркнутый', label: <s>З</s>, onClick: () => surround('~~', '~~') },
      { key: 'code', title: 'Код', label: '</>', onClick: () => surround('`', '`') },
    ],
    [
      {
        key: 'ul',
        title: 'Маркированный список',
        label: '• Список',
        onClick: () => prefixLines('- '),
      },
      {
        key: 'ol',
        title: 'Нумерованный список',
        label: '1. Список',
        onClick: () => prefixLines('1. '),
      },
      { key: 'quote', title: 'Цитата', label: '❝', onClick: () => prefixLines('> ') },
      {
        key: 'table',
        title: 'Таблица',
        label: 'Таблица',
        onClick: () => insertBlock('| Заголовок | Заголовок |\n| --- | --- |\n| Ячейка | Ячейка |'),
      },
    ],
    [
      {
        key: 'link',
        title: 'Ссылка',
        label: 'Ссылка',
        onClick: () => {
          const url = promptSafeUrl('Адрес ссылки');
          if (url) surround('[', `](${url})`);
        },
      },
      {
        key: 'image',
        title: 'Картинка',
        label: 'Картинка',
        onClick: () => {
          const url = promptSafeUrl('Адрес картинки (сначала загрузите файл ниже)');
          if (url) insertBlock(`![Подпись к картинке](${url})`);
        },
      },
      {
        key: 'video',
        title: 'Видео',
        label: 'Видео',
        onClick: () => {
          const url = promptSafeUrl('Адрес видео (.mp4)');
          if (url) insertBlock(`![Видео](${url})`);
        },
      },
      { key: 'hr', title: 'Разделитель', label: '—', onClick: () => insertBlock('---') },
    ],
  ];

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!event.ctrlKey && !event.metaKey) return;
    const key = event.key.toLowerCase();
    if (key === 'b') {
      event.preventDefault();
      surround('**', '**');
    }
    if (key === 'i') {
      event.preventDefault();
      surround('*', '*');
    }
  };

  return (
    <div className={style.modeSurface}>
      <EditorToolbar groups={groups} />
      <textarea
        ref={textareaRef}
        className={style.markdownInput}
        value={value}
        onChange={event => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        aria-label="Текст статьи в разметке Markdown"
        spellCheck
      />
      <div className={style.cheatsheet}>
        <span>
          <code>**жирный**</code>
        </span>
        <span>
          <code>*курсив*</code>
        </span>
        <span>
          <code># заголовок</code>
        </span>
        <span>
          <code>- пункт списка</code>
        </span>
        <span>
          <code>[текст](ссылка)</code>
        </span>
        <span>
          <code>![подпись](адрес-файла)</code> — картинка или видео
        </span>
      </div>
    </div>
  );
};

export default MarkdownMode;
