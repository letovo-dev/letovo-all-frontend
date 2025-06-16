// 'use client';
// import style from './TextArea.module.scss';
// import { useEffect, useRef } from 'react';

// interface TextareaAutoHeightProps {
//   value: string;
//   onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
//   maxHeight?: number;
//   [key: string]: any;
// }

// const TextareaAutoHeight: React.FC<TextareaAutoHeightProps> = ({
//   value,
//   onChange,
//   maxHeight = 300,
//   ...props
// }) => {
//   const textareaRef = useRef<HTMLTextAreaElement>(null);

//   useEffect(() => {
//     const textarea = textareaRef.current;
//     if (textarea) {
//       textarea.style.height = 'auto';
//       const newHeight = Math.min(textarea.scrollHeight, maxHeight);
//       textarea.style.height = `${newHeight}px`;
//       textarea.style.overflowY = newHeight >= maxHeight ? 'auto' : 'hidden';
//     }
//   }, [value, maxHeight]);

//   const valueName = value.split(' ').find((el: string) => el.startsWith('@'));
//   const editedValue = valueName ? value.replace(valueName, '') : value;

//   return (
//     <textarea
//       ref={textareaRef}
//       value={value}
//       onChange={onChange}
//       className={style.autoHeightTextarea}
//       {...props}
//     >
//       <span className={style.nickName}>{valueName}</span>
//       {editedValue}
//     </textarea>
//   );
// };

// export default TextareaAutoHeight;
'use client';
import style from './TextArea.module.scss';
import { useEffect, useRef } from 'react';
import ContentEditable from 'react-contenteditable';

interface TextareaAutoHeightProps {
  value: string | undefined;
  onChange: (event: React.ChangeEvent<HTMLDivElement>) => void;
  maxHeight?: number;
  [key: string]: any;
}

const TextareaAutoHeight: React.FC<TextareaAutoHeightProps> = ({
  value,
  onChange,
  maxHeight = 300,
  ...props
}) => {
  const divRef = useRef<HTMLDivElement>(null);

  // Приведение value к строке
  const safeValue = typeof value === 'string' ? value : '';

  // Автоматическая подстройка высоты
  useEffect(() => {
    const div = divRef.current;
    if (div) {
      div.style.height = 'auto';
      const newHeight = Math.min(div.scrollHeight, maxHeight);
      div.style.height = `${newHeight}px`;
      div.style.overflowY = newHeight >= maxHeight ? 'auto' : 'hidden';
    }
  }, [safeValue, maxHeight]);

  // Парсинг safeValue для поиска никнейма (@username)
  const valueNameMatch = safeValue.match(/@\w+/);
  const valueName = valueNameMatch ? valueNameMatch[0] : '';
  const valueNameIndex = valueName ? safeValue.indexOf(valueName) : -1;

  // Разделяем текст на части: до никнейма, никнейм, после никнейма
  let beforeNickname = '';
  let afterNickname = '';
  if (valueName && valueNameIndex !== -1) {
    beforeNickname = safeValue.slice(0, valueNameIndex);
    afterNickname = safeValue.slice(valueNameIndex + valueName.length);
  } else {
    beforeNickname = safeValue;
  }

  console.log('value:', safeValue);
  console.log('valueName:', valueName);
  console.log('beforeNickname:', beforeNickname);
  console.log('afterNickname:', afterNickname);

  // Экранирование HTML для безопасности, без преобразования пробелов
  const escapeHtml = (text: string) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  // Формируем HTML для рендеринга
  const html = valueName
    ? `${escapeHtml(beforeNickname)}<span class="${style.nickName}">${escapeHtml(
        valueName,
      )}</span>${escapeHtml(afterNickname)}`
    : escapeHtml(safeValue);

  console.log('rendered html:', html);

  // Обработчик изменений
  const handleChange = (evt: { target: { value: string } }) => {
    // Извлекаем чистый текст, заменяя &nbsp; на обычный пробел
    const newValue = evt.target.value
      .replace(/<span[^>]*>(.*?)<\/span>/g, '$1') // Удаляем <span>, сохраняя содержимое
      .replace(/&nbsp;/g, ' ') // Заменяем &nbsp; на пробел
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    console.log('newValue:', newValue);
    const syntheticEvent = {
      target: { value: newValue },
    } as React.ChangeEvent<HTMLDivElement>;
    onChange(syntheticEvent);
  };

  return (
    <ContentEditable
      innerRef={divRef}
      html={html}
      onChange={handleChange}
      className={style.autoHeightTextarea}
      {...props}
    />
  );
};

export default TextareaAutoHeight;
