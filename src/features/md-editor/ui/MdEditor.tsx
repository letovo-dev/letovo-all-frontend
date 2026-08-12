'use client';

import React, { useState, ChangeEvent, useRef, useEffect, useCallback } from 'react';
import style from './MdEditor.module.scss';
import { mdExample } from '../lib/mdExapmle';
import { buildArticlePayload, type CategorySelectItem } from '../model/buildArticlePayload';
import UploadFiles from './upload-file/UploadFiles';
import MarkdownMode from './MarkdownMode';
import VisualMode from './VisualMode';
import articlesStore from '@/shared/stores/articles-store';
import { ArticleContent } from '@/shared/ui/article-content';
import {
  Button,
  ConfigProvider,
  Input,
  message,
  Radio,
  Space,
  Select,
  Form,
  Divider,
  Segmented,
} from 'antd';
import { PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { usePathname } from 'next/navigation';
import type { UploadFile } from 'antd';
import { uniqueId } from 'lodash';
import { useRouter } from 'next/navigation';
import type { InputRef } from 'antd';

const EDIT_ARTICLE_TITLE = 'Отредактируйте название статьи';
const INPUT_ARTICLE_TITLE = 'Введите название статьи';

type EditorMode = 'markdown' | 'visual';

const EDITOR_MODE_STORAGE_KEY = 'letovo:article-editor-mode';

const isEditorMode = (value: unknown): value is EditorMode =>
  value === 'markdown' || value === 'visual';

const MarkdownEditor: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [markdown, setMarkdown] = useState<string>(mdExample);
  const [articleTitle, setArticleTitle] = useState<string>('');
  const [fileList, setFileList] = useState<UploadFile[] | undefined>(undefined);
  const [mode, setMode] = useState<EditorMode>('markdown');
  const [mobilePreview, setMobilePreview] = useState(false);
  /**
   * Счётчик «текст пришёл извне»: визуальный режим пересобирает свой DOM только
   * по нему, иначе курсор прыгал бы на каждый набранный символ.
   */
  const [syncKey, setSyncKey] = useState(0);

  const replaceMarkdown = useCallback((value: string) => {
    setMarkdown(value);
    setSyncKey(key => key + 1);
  }, []);

  const {
    article,
    isEditArticle,
    renameArticle,
    createOrUpdateArticle,
    articlesCategories,
    setCurrentArticle,
    refreshArticles,
  } = articlesStore(state => state);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const inputTitleHeader = isEditArticle ? EDIT_ARTICLE_TITLE : INPUT_ARTICLE_TITLE;
  const [selectCategoryItems, setSelectCategoryItems] = useState<CategorySelectItem[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const inputCategoryRef = useRef<InputRef>(null);

  useEffect(() => {
    return () => {
      setCurrentArticle(undefined);
    };
  }, [pathname]);

  useEffect(() => {
    setSelectCategoryItems(
      articlesCategories?.map(category => ({
        value: category.category,
        label: category.category_name,
        text: '',
      })),
    );
  }, [articlesCategories]);

  const success = (text: string) => {
    messageApi.open({
      type: 'success',
      content: text,
    });
  };

  const error = (text: string) => {
    messageApi.open({
      type: 'error',
      content: text,
    });
  };

  const warning = (text: string) => {
    messageApi.open({
      type: 'warning',
      content: text,
    });
  };

  // Выбранный режим запоминается: автор обычно пишет всегда в одном и том же.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(EDITOR_MODE_STORAGE_KEY);
      if (isEditorMode(stored)) setMode(stored);
    } catch (err) {
      console.error('Не удалось прочитать режим редактора:', err);
    }
  }, []);

  const handleModeChange = (nextMode: EditorMode) => {
    setMode(nextMode);
    // Визуальный режим строится из текущего Markdown — пересобираем его DOM.
    if (nextMode === 'visual') setSyncKey(key => key + 1);
    try {
      window.localStorage.setItem(EDITOR_MODE_STORAGE_KEY, nextMode);
    } catch (err) {
      console.error('Не удалось сохранить режим редактора:', err);
    }
  };

  useEffect(() => {
    if (isEditArticle && article) {
      replaceMarkdown(article.text || '');
      setArticleTitle(article.title || '');
      form.setFieldsValue({
        isSecret: article.is_secret || 'f',
        category: article.category || undefined,
        articleTitle: article.title || undefined,
      });
    } else {
      replaceMarkdown(mdExample);
      setArticleTitle('');
      form.resetFields();
    }
  }, [isEditArticle, article, form, replaceMarkdown]);

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.md')) {
      error('Допускаются только файлы с расширением .md');
      return;
    }
    if (file.size > 512_000) {
      error('Файл слишком большой (максимум 500 КБ)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>): void => {
      if (e.target?.result) {
        replaceMarkdown(e.target.result as string);
      }
    };
    reader.readAsText(file);
  };

  const handleDownload = (): void => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'edited-markdown.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = async (values: {
    isSecret: string;
    category: string;
    articleTitle?: string;
  }) => {
    if (!articleTitle.trim()) {
      error('Название статьи не может быть пустым');
      return;
    }

    if (isEditArticle && !article) {
      error('Не удалось сохранить статью');
      return;
    }

    const articleName = isEditArticle
      ? article?.post_path.split('/').at(-1)
      : `${uniqueId('article_')}.md`;

    try {
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const file = new File([blob], `${articleName}`, { type: 'text/markdown' });
      const formData = new FormData();
      formData.append('file', file);
      const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL_UPLOAD}`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Ошибка загрузки файла');
      }

      const uploadResult = await uploadResponse.json();
      const fileUrl = uploadResult.file;

      const { payload, isNewRequest, shouldRefreshAfterSuccess } = buildArticlePayload({
        article,
        isEditArticle,
        values,
        articlesCategories,
        selectCategoryItems,
        uploadedFilePath: fileUrl,
      });

      const res = await createOrUpdateArticle(payload, isNewRequest);

      if (res === 'success') {
        if (shouldRefreshAfterSuccess) {
          await refreshArticles();
        }
        success(isEditArticle ? 'Статья обновлена' : 'Статья сохранена');
        router.push('/articles');
      } else {
        error(isEditArticle ? 'Не удалось обновить статью' : 'Не удалось сохранить статью');
      }
    } catch (err) {
      console.error('Save article error:', err);
      error('Не удалось сохранить статью');
    }
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setArticleTitle(e.target.value);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleTitleSave = async () => {
    if (!articleTitle.trim()) {
      error('Статья не может быть без названия');
      return;
    }
    if (article) {
      await renameArticle(article.category, article.post_id, articleTitle);
      success('Название статьи обновлено');
    }
  };

  const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCategoryName(event.target.value);
  };

  const addItem = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    e.preventDefault();
    setSelectCategoryItems([
      ...selectCategoryItems,
      { label: categoryName, value: categoryName, text: 'new' },
    ]);
    setCategoryName('');
    setTimeout(() => {
      inputCategoryRef.current?.focus();
    }, 0);
  };

  return (
    <div className={style.markdownEditorContainer}>
      {contextHolder}
      <h2>Редактор статьи</h2>
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

        {isEditArticle && (
          <div className={style.titleInputContainer}>
            <p className={style.inputTitleInstruction}>{inputTitleHeader}</p>
            <Space.Compact
              style={{ width: 'fit-content', marginTop: '8px' }}
              onClick={e => e.stopPropagation()}
            >
              <Input
                value={articleTitle}
                onChange={handleTitleChange}
                placeholder="Название статьи"
                maxLength={200}
              />
              <Button
                type="primary"
                style={{ backgroundColor: '#fb4724' }}
                onClick={handleTitleSave}
              >
                <SaveOutlined />
              </Button>
            </Space.Compact>
          </div>
        )}
        <Form
          id="markdown-form"
          form={form}
          onFinish={handleSave}
          layout="inline"
          initialValues={{
            isSecret: 'f',
            category: undefined,
            articleTitle: undefined,
          }}
        >
          {!isEditArticle && (
            <Form.Item
              name="articleTitle"
              label="Название статьи"
              rules={[{ required: true, message: 'Введите название' }]}
            >
              <Input
                value={articleTitle}
                onChange={handleTitleChange}
                placeholder="Название статьи"
                maxLength={200}
              />
            </Form.Item>
          )}
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#fb4724',
                colorPrimaryActive: '#fb4724',
              },
            }}
          >
            <Form.Item
              name="isSecret"
              label="Тип статьи"
              rules={[{ required: true, message: 'Выберите тип статьи' }]}
            >
              <Radio.Group
                options={[
                  { value: 't', label: 'Тайна' },
                  { value: 'f', label: 'Статья' },
                ]}
              />
            </Form.Item>
          </ConfigProvider>
          <Form.Item
            name="category"
            label="Категория"
            rules={[{ required: true, message: 'Выберите или создайте категорию статьи' }]}
          >
            <Select
              placeholder="Категория статьи"
              style={{ width: '300px' }}
              popupRender={menu => (
                <>
                  {menu}
                  <Divider style={{ margin: '8px 0' }} />
                  <Space style={{ padding: '0 8px 4px' }}>
                    <Input
                      placeholder="Название категории"
                      ref={inputCategoryRef}
                      value={categoryName}
                      onChange={onNameChange}
                      onKeyDown={e => e.stopPropagation()}
                      maxLength={100}
                    />
                    <Button type="text" icon={<PlusOutlined />} onClick={addItem}>
                      Добавить
                    </Button>
                  </Space>
                </>
              )}
              options={selectCategoryItems}
            />
          </Form.Item>
        </Form>
      </div>
      {articleTitle && <h3>{articleTitle}</h3>}

      <div className={style.workArea}>
        <section className={style.panel}>
          <div className={style.panelHead}>
            Текст статьи
            <span className={style.panelHint}>
              {mode === 'markdown'
                ? 'Разметка Markdown, справа — превью статьи'
                : 'Пишите прямо в статье — разметку набирать не нужно'}
            </span>
            <span className={style.panelSpacer} />
            <ConfigProvider theme={{ token: { colorPrimary: '#fb4724' } }}>
              <Segmented<EditorMode>
                value={mode}
                onChange={handleModeChange}
                options={[
                  { value: 'markdown', label: 'Разметка' },
                  { value: 'visual', label: 'Как на сайте' },
                ]}
              />
            </ConfigProvider>
          </div>

          {mode === 'markdown' ? (
            <MarkdownMode value={markdown} onChange={setMarkdown} />
          ) : (
            <VisualMode value={markdown} onChange={setMarkdown} syncKey={syncKey} />
          )}
        </section>

        {mode === 'markdown' && (
          <div className={style.previewColumn}>
            <div className={style.previewToolbar}>
              <strong>Так статья будет выглядеть на сайте</strong>
              <span className={style.panelSpacer} />
              <Button size="small" onClick={() => setMobilePreview(false)}>
                Десктоп
              </Button>
              <Button size="small" onClick={() => setMobilePreview(true)}>
                Мобильный
              </Button>
            </div>
            <div
              className={`${style.articleShell} ${style.previewScroll} ${
                mobilePreview ? style.mobilePreview : ''
              }`}
            >
              <ArticleContent content={markdown} interactive={false} />
            </div>
          </div>
        )}
      </div>
      <p className={style.inputTitleInstruction}>
        Для того, чтобы ваше изображение или видео появились в статье, их нужно предварительно
        загрузить в базу данных. После загрузки файла появиться сообщение с адресом для доступа к
        файлу, который нужно скопировать и в точности указать в статье. Например:
        ![image](https://example.com/image.png)
      </p>
      <div className={style.uploadContainer}>
        <UploadFiles setFileList={setFileList} fileList={fileList} />
        {fileList && fileList[0]?.response && typeof fileList[0].response === 'string' && (
          <p>
            {`${process.env.NEXT_PUBLIC_BASE_URL_MEDIA}`}
            {fileList[0].response}
          </p>
        )}
      </div>
      <p className={style.inputTitleInstruction}>
        Название файла должно быть идентично названию, указанному в статье
      </p>
      <div className={style.buttonsContainer}>
        <Button
          type="primary"
          htmlType="submit"
          className={style.button}
          style={{ backgroundColor: '#fb4724' }}
          form="markdown-form"
        >
          Сохранить и опубликовать
        </Button>
        <button onClick={handleDownload} className={style.button}>
          Скачать
        </button>
      </div>
    </div>
  );
};

export default MarkdownEditor;
