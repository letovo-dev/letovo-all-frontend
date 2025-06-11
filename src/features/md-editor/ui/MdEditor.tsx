'use client';

import React, { useState, ChangeEvent, useRef, useEffect } from 'react';
import MDEditor, { MDEditorProps } from '@uiw/react-md-editor';
import style from './MdEditor.module.scss';
import { mdExample } from '../lib/mdExapmle';
import UploadFiles from './upload-file/UploadFiles';
import articlesStore from '@/shared/stores/articles-store';
import { Button, Input, message, Space } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import userStore from '@/shared/stores/user-store';

interface VideoComponentProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src?: string;
}

const MarkdownEditor: React.FC = () => {
  const [markdown, setMarkdown] = useState<string>(mdExample);
  const [articleTitle, setArticleTitle] = useState<string>('');
  const { article, isEditArticle, renameArticle } = articlesStore(state => state);

  useEffect(() => {
    if (article && isEditArticle) {
      setMarkdown(article.text);
      setArticleTitle(article.title || ''); // Убедитесь, что title не undefined
    }
  }, [isEditArticle, article]);

  // Function to handle MD file upload
  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>): void => {
        if (e.target?.result) {
          setMarkdown(e.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSave = (): void => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'edited-markdown.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setArticleTitle(e.target.value);
  };

  const videoComponent = ({ src, ...props }: VideoComponentProps) => {
    console.log('Video Component Rendered:', { src, props });
    return src ? (
      <video controls src={src} style={{ maxWidth: '100%' }} {...props}>
        Your browser does not support the video tag.
      </video>
    ) : null;
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleTitleSave = async () => {
    if (!articleTitle.trim()) {
      message.error('Название статьи не может быть пустым');
      return;
    }
    if (article) {
      await renameArticle(article?.post_id, article?.category, articleTitle);
      console.log('Saving title:', articleTitle);
    }
  };

  return (
    <div className={style.markdownEditorContainer}>
      <h2>Редактор Markdown</h2>
      <div className={style.titlesContainer}>
        <div>
          <input
            type="file"
            accept=".md"
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <button onClick={handleButtonClick} className={style.button}>
            Выберите md-файл
          </button>
        </div>
        <div className={style.titleInputContainer}>
          <p className={style.inputTitleInstruction}>Введите или отредактируйте название статьи</p>
          <Space.Compact
            style={{ width: 'fit-content', marginTop: '8px' }}
            onClick={e => e.stopPropagation()}
          >
            <Input
              value={articleTitle}
              onChange={handleTitleChange}
              placeholder="Название статьи"
            />
            <Button type="primary" style={{ backgroundColor: '#fb4724' }} onClick={handleTitleSave}>
              <SaveOutlined />
            </Button>
          </Space.Compact>
        </div>
      </div>
      {articleTitle && <h3>{articleTitle}</h3>}
      <MDEditor
        value={markdown}
        onChange={(value: string | undefined) => setMarkdown(value || '')}
        preview="live"
        className={style.markdownEditor}
        visibleDragbar={true}
        previewOptions={{
          components: {
            video: videoComponent,
          },
          urlTransform: (uri: string) => {
            return uri.endsWith('.mp4') ? uri : uri;
          },
        }}
      />
      <p>Приложите новые файлы, используемые в статье</p>
      <UploadFiles />
      <button onClick={handleSave} className={style.button}>
        Сохранить и опубликовать
      </button>
    </div>
  );
};

export default MarkdownEditor;
