'use client';

import React, { useState, ChangeEvent, useRef, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import style from './MdEditor.module.scss';
import { mdExample } from '../lib/mdExapmle';
import UploadFiles from './upload-file/UploadFiles';
import articlesStore, { OneArticle } from '@/shared/stores/articles-store';
import { Button, ConfigProvider, Input, message, Radio, Space, Select, Form, Divider } from 'antd';
import { PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { usePathname } from 'next/navigation';
import type { UploadFile } from 'antd';
import authStore from '@/shared/stores/auth-store';
import { uniqueId } from 'lodash';
import { useRouter } from 'next/navigation';
import type { InputRef } from 'antd';

interface VideoComponentProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src?: string;
}

const EDIT_ARTICLE_TITLE = 'Отредактируйте название статьи';
const INPUT_ARTICLE_TITLE = 'Введите название статьи';

const MarkdownEditor: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [markdown, setMarkdown] = useState<string>(mdExample);
  const [articleTitle, setArticleTitle] = useState<string>('');
  const [fileList, setFileList] = useState<UploadFile[] | undefined>(undefined);

  const {
    article,
    isEditArticle,
    renameArticle,
    createOrUpdateArticle,
    articlesCategories,
    setCurrentArticle,
  } = articlesStore(state => state);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const inputTitleHeader = isEditArticle ? EDIT_ARTICLE_TITLE : INPUT_ARTICLE_TITLE;
  const { userStatus } = authStore(state => state);
  const [selectCategoryItems, setSelectCategoryItems] = useState<
    { value: string; label: string; text: string }[]
  >([]);
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

  useEffect(() => {
    if (isEditArticle && article) {
      setMarkdown(article.text || '');
      setArticleTitle(article.title || '');
      form.setFieldsValue({
        isSecret: article.is_secret || 'f',
        category: article.category || undefined,
        articleTitle: article.title || undefined,
      });
    } else {
      setMarkdown(mdExample);
      setArticleTitle('');
      form.resetFields();
    }
  }, [isEditArticle, article, form]);

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
        headers: {
          Bearer: `${userStatus.token || ''}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Ошибка загрузки файла');
      }
      const categoryValueItem = selectCategoryItems.find(
        (category: { value: string; label: string }) => category.value === values.category,
      );

      const currentCategory = articlesCategories.find(
        item => item.category_name === values.category,
      );

      const uploadResult = await uploadResponse.json();
      const fileUrl = uploadResult.file;
      const editedDataCategoryValue =
        categoryValueItem?.text === 'new' ? 'category_name' : 'category';
      const data: Partial<OneArticle> = isEditArticle
        ? {
            ...article,
            text: '',
            is_secret: values.isSecret,
            [editedDataCategoryValue]:
              categoryValueItem?.text === 'new' ? values.category : currentCategory?.category,
          }
        : {
            title: values.articleTitle ?? '',
            text: '',
            is_secret: values.isSecret,
            category_name: values.category,
            post_path: fileUrl ?? '',
          };

      if (isEditArticle) {
        if (categoryValueItem?.text === 'new') {
          delete data.category;
          delete data.post_id;
        }
        const res = await createOrUpdateArticle(data, categoryValueItem?.text === 'new');
        if (res === 'success') {
          success('Статья обновлена');
        } else {
          error('Не удалось обновить статью');
        }
      } else {
        const res = await createOrUpdateArticle(data, true);
        if (res === 'success') {
          success('Статья сохранена');
        } else {
          error('Не удалось сохранить статью');
        }
      }
      router.push('/articles');
    } catch (err) {
      console.error('Save article error:', err);
      error('Не удалось сохранить статью');
    }
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setArticleTitle(e.target.value);
  };

  const videoComponent = ({ src, ...props }: VideoComponentProps) => {
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
      error('Статья не может быть без названия');
      return;
    }
    if (article) {
      await renameArticle(article.category, article.post_id, articleTitle);
      success('Название статьи обновлено');
    }
  };

  const linkComponent = ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const isSecretLink =
      typeof children === 'string' && children.toLowerCase().includes('secret link');
    return (
      <a href={href} className={isSecretLink ? style.secretLink : undefined} {...props}>
        {children}
      </a>
    );
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
      <MDEditor
        value={markdown}
        onChange={(value: string | undefined) => setMarkdown(value || '')}
        preview="live"
        className={style.markdownEditor}
        visibleDragbar={true}
        previewOptions={{
          components: {
            video: videoComponent,
            a: linkComponent,
          },
          urlTransform: (uri: string) => {
            return uri.endsWith('.mp4') ? uri : uri;
          },
        }}
      />
      <p className={style.inputTitleInstruction}>
        Для того, чтобы ваше изображение или видео появились в статье, их нужно предварительно
        загрузить в базу данных. После загрузки файла появиться сообщение с адресом для доступа к
        файлу, который нужно скопировать и в точности указать в статье. Например:
        ![image](https://example.com/image.png)
      </p>
      <div className={style.uploadContainer}>
        <UploadFiles
          setFileList={setFileList}
          fileList={fileList}
          token={userStatus?.token ?? ''}
        />
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
