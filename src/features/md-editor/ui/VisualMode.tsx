'use client';

import React, { useEffect, useRef, useState } from 'react';
import EditorToolbar, { type ToolbarItem } from './EditorToolbar';
import htmlToMarkdown from '../lib/htmlToMarkdown';
import { ArticleContent } from '@/shared/ui/article-content';
import { promptSafeUrl } from '../lib/safeUrl';
import style from './MdEditor.module.scss';
// Те же стили, что у опубликованной статьи: редактируемая область и есть статья.
import articleStyle from '@/shared/ui/article-content/ArticleContent.module.scss';

interface VisualModeProps {
  value: string;
  onChange: (value: string) => void;
  /**
   * Меняется, когда текст пришёл извне (открыли другую статью, загрузили файл,
   * переключились из режима разметки) — только тогда пересобираем DOM, иначе
   * курсор прыгал бы на каждый набранный символ.
   */
  syncKey: number;
}

/**
 * Режим «Как на сайте»: редактируется сама статья, а на сервер по-прежнему
 * уходит Markdown — его собирает htmlToMarkdown на каждое изменение.
 */
const VisualMode: React.FC<VisualModeProps> = ({ value, onChange, syncKey }) => {
  const editableRef = useRef<HTMLDivElement>(null);
  const sourceRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef(value);
  valueRef.current = value;

  /**
   * Markdown, из которого собрана редактируемая статья. Обновляется только когда
   * текст пришёл извне: скрытый ArticleContent — тот же компонент, что рисует
   * статью на сайте, поэтому «что редактирую» и «что опубликуется» совпадают.
   */
  const [seedMarkdown, setSeedMarkdown] = useState(value);

  useEffect(() => {
    setSeedMarkdown(valueRef.current);
  }, [syncKey]);

  // Скрытая копия уже отрисована React'ом — переносим её разметку в contenteditable.
  useEffect(() => {
    const editable = editableRef.current;
    const source = sourceRef.current;
    if (!editable || !source) return;

    const rendered = source.firstElementChild;
    const isArticleWrapper =
      Boolean(articleStyle.mdContent) &&
      source.childElementCount === 1 &&
      rendered?.classList.contains(articleStyle.mdContent);

    // Внешний контейнер статьи уже есть у самой редактируемой области, вложенный
    // дал бы двойные отступы.
    editable.innerHTML = (isArticleWrapper ? rendered?.innerHTML : source.innerHTML) ?? '';
  }, [seedMarkdown]);

  const syncMarkdown = () => {
    const element = editableRef.current;
    if (element) onChange(htmlToMarkdown(element));
  };

  const exec = (command: string, commandValue?: string) => {
    editableRef.current?.focus();
    document.execCommand(command, false, commandValue);
    syncMarkdown();
  };

  const insertHtml = (html: string) => {
    editableRef.current?.focus();
    document.execCommand('insertHTML', false, html);
    syncMarkdown();
  };

  const groups: ToolbarItem[][] = [
    [
      { key: 'h1', title: 'Заголовок 1', label: 'H1', onClick: () => exec('formatBlock', 'h1') },
      { key: 'h2', title: 'Заголовок 2', label: 'H2', onClick: () => exec('formatBlock', 'h2') },
      { key: 'h3', title: 'Заголовок 3', label: 'H3', onClick: () => exec('formatBlock', 'h3') },
      { key: 'p', title: 'Обычный текст', label: 'Текст', onClick: () => exec('formatBlock', 'p') },
    ],
    [
      { key: 'bold', title: 'Жирный (Ctrl+B)', label: <b>Ж</b>, onClick: () => exec('bold') },
      { key: 'italic', title: 'Курсив (Ctrl+I)', label: <i>К</i>, onClick: () => exec('italic') },
      {
        key: 'strike',
        title: 'Зачёркнутый',
        label: <s>З</s>,
        onClick: () => exec('strikeThrough'),
      },
    ],
    [
      {
        key: 'ul',
        title: 'Маркированный список',
        label: '• Список',
        onClick: () => exec('insertUnorderedList'),
      },
      {
        key: 'ol',
        title: 'Нумерованный список',
        label: '1. Список',
        onClick: () => exec('insertOrderedList'),
      },
      {
        key: 'quote',
        title: 'Цитата',
        label: '❝',
        onClick: () => exec('formatBlock', 'blockquote'),
      },
      {
        key: 'table',
        title: 'Таблица',
        label: 'Таблица',
        onClick: () =>
          insertHtml(
            '<table><thead><tr><th>Заголовок</th><th>Заголовок</th></tr></thead>' +
              '<tbody><tr><td>Ячейка</td><td>Ячейка</td></tr></tbody></table><p><br></p>',
          ),
      },
    ],
    [
      {
        key: 'link',
        title: 'Ссылка',
        label: 'Ссылка',
        onClick: () => {
          const url = promptSafeUrl('Адрес ссылки');
          if (url) exec('createLink', url);
        },
      },
      {
        key: 'image',
        title: 'Картинка',
        label: 'Картинка',
        onClick: () => {
          const url = promptSafeUrl('Адрес картинки (сначала загрузите файл ниже)');
          if (url) insertHtml(`<img src="${encodeURI(url)}" alt="Изображение статьи">`);
        },
      },
      {
        key: 'video',
        title: 'Видео',
        label: 'Видео',
        onClick: () => {
          const url = promptSafeUrl('Адрес видео (.mp4)');
          if (url) {
            insertHtml(
              `<video controls playsinline width="100%" style="max-width:800px;height:auto" src="${encodeURI(
                url,
              )}" aria-label="Video"></video><p><br></p>`,
            );
          }
        },
      },
      {
        key: 'clear',
        title: 'Убрать форматирование',
        label: 'Очистить',
        onClick: () => exec('removeFormat'),
      },
    ],
  ];

  // Вставка из Word/Docs приносит чужую разметку и стили — берём только текст.
  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const text = event.clipboardData.getData('text/plain');
    if (!text) return;
    event.preventDefault();
    document.execCommand('insertText', false, text);
    syncMarkdown();
  };

  return (
    <div className={style.modeSurface}>
      <EditorToolbar groups={groups} />
      <div className={style.visualFrame}>
        <div className={style.articleShell}>
          <div
            ref={editableRef}
            className={`${articleStyle.mdContent} ${style.visualEditable}`}
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-multiline="true"
            aria-label="Текст статьи"
            spellCheck
            onInput={syncMarkdown}
            onBlur={syncMarkdown}
            onPaste={handlePaste}
          />
        </div>
      </div>
      <div ref={sourceRef} hidden aria-hidden="true">
        <ArticleContent content={seedMarkdown} interactive={false} />
      </div>
    </div>
  );
};

export default VisualMode;
