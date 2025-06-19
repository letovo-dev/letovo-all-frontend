'use client';

import React, { useEffect } from 'react';
import { Modal, Form, Select, Input, Upload, Button, InputNumber, ConfigProvider, App } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';

export interface Post {
  id?: string;
  author: string;
  title: string;
  text: string;
  mediaUrl?: string[];
  likes: string;
  dislikes: string;
  saved_count: string;
  post_id?: number;
  post_path?: string;
  is_secret?: string;
  parent_id?: string;
  date?: string;
  category?: string;
  category_name?: string;
  avatar_pic?: string;
  is_liked?: string;
  is_disliked?: string;
  saved?: string;
}

interface PostModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: Post) => Promise<void>;
  post?: Post | null; // Optional post for editing
  authors: { id: string; name: string }[]; // List of authors for Select
}

const PostModal: React.FC<PostModalProps> = ({ visible, onCancel, onSubmit, post, authors }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = React.useState<any[]>([]);
  const { message } = App.useApp();

  // console.log('post', post);

  // Reset form and file list when modal opens or post changes
  useEffect(() => {
    if (visible) {
      if (post) {
        // Edit mode: populate form with post data
        form.setFieldsValue({
          author: post.author,
          title: post.title,
          text: post.text,
          likes: post.likes,
          dislikes: post.dislikes,
          saved_count: post.saved_count,
        });
        // Set file list if post has media
        if (post.mediaUrl && Array.isArray(post.mediaUrl) && post.mediaUrl.length > 0) {
          setFileList(
            post.mediaUrl.map((url, index) => ({
              uid: `-${index + 1}`,
              name: url.split('/').pop() || `file-${index + 1}`,
              status: 'done',
              url,
            })),
          );
        } else {
          setFileList([]);
        }
      } else {
        form.resetFields();
        setFileList([]);
      }
    }
  }, [visible, post, form]);

  const handleSubmit = async (values: any) => {
    try {
      const formData = {
        ...values,
        mediaUrl: fileList.map(file => file.url || file.response?.url).filter(Boolean),
      };
      await onSubmit(formData);
      message.success(post ? 'Пост успешно изменен' : 'Пост успешно сохранен');
      onCancel();
    } catch (error) {
      message.error('Не удалось сохранить пост');
      console.error('Submit error:', error);
    }
  };

  console.log('fileList', fileList);

  // const uploadProps: UploadProps = {
  //   name: 'file',
  //   accept: 'image/*,video/*',
  //   fileList,
  //   action: process.env.NEXT_PUBLIC_UPLOAD_URL,
  //   headers: {
  //     Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
  //   },
  //   onChange: async ({ file, fileList: newFileList }) => {
  //     console.log('Upload file:', {
  //       name: file.name,
  //       status: file.status,
  //       response: file.response,
  //       error: file.error,
  //       action: process.env.NEXT_PUBLIC_UPLOAD_URL,
  //       token: localStorage.getItem('token') || 'No token',
  //     });
  //     if (file.status === 'removed' && file.url) {
  //       try {
  //         const response = await fetch('/api/delete-file', {
  //           method: 'DELETE',
  //           headers: {
  //             'Content-Type': 'application/json',
  //             Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
  //           },
  //           body: JSON.stringify({ url: file.url }),
  //         });
  //         if (!response.ok) {
  //           const errorData = await response.json().catch(() => ({}));
  //           throw new Error(errorData.message || `Не удалось удалить файл: ${response.status}`);
  //         }
  //         message.info(`${file.name} удалён`);
  //         setFileList(newFileList);
  //       } catch (error) {
  //         const errorMsg = error instanceof Error ? error.message : String(error);
  //         message.error(`Не удалось удалить файл: ${errorMsg}`);
  //         console.error('Delete error:', error);
  //       }
  //     } else {
  //       setFileList(newFileList);
  //       if (file.status === 'done') {
  //         const filePath = file.response?.url;
  //         if (filePath) {
  //           console.log('File saved at:', filePath);
  //           message.success(`${file.name} загружен успешно по пути: ${filePath}`);
  //         } else {
  //           message.error('Неверный ответ сервера: путь не возвращён');
  //           console.error('No URL in response:', file.response);
  //         }
  //       } else if (file.status === 'error') {
  //         const errorMessage =
  //           file.response?.message ||
  //           file.error?.message ||
  //           `Ошибка загрузки ${file.name}: Неизвестная ошибка`;
  //         message.error(errorMessage);
  //         console.error('Upload error details:', {
  //           file: {
  //             name: file.name,
  //             status: file.status,
  //             response: file.response,
  //             error: file.error,
  //           },
  //           action: process.env.NEXT_PUBLIC_UPLOAD_URL,
  //           token: localStorage.getItem('token') || 'No token',
  //         });
  //       }
  //     }
  //   },
  //   beforeUpload: file => {
  //     console.log('Before upload:', { name: file.name, size: file.size, type: file.type });
  //     const isValid = file.type.startsWith('image/') || file.type.startsWith('video/');
  //     if (!isValid) {
  //       message.error('Можно загружать только изображения или видео!');
  //       return Upload.LIST_IGNORE;
  //     }
  //     const isLt10M = file.size / 1024 / 1024 < 10;
  //     if (!isLt10M) {
  //       message.error('Файл должен быть меньше 10 МБ!');
  //       return Upload.LIST_IGNORE;
  //     }
  //     const token = localStorage.getItem('token');
  //     if (!token) {
  //       message.error('Токен авторизации отсутствует. Пожалуйста, войдите в систему.');
  //       return Upload.LIST_IGNORE;
  //     }
  //     return true;
  //   },
  // };
  const uploadProps: UploadProps = {
    name: 'file',
    accept: 'image/*,video/*',
    fileList,
    action: process.env.NEXT_PUBLIC_UPLOAD_URL || 'http://127.0.0.1:8880/upload',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    },
    onChange: async ({ file, fileList: newFileList }) => {
      console.log('Upload file:', {
        name: file.name,
        status: file.status,
        response: file.response,
        error: file.error,
        action: process.env.NEXT_PUBLIC_UPLOAD_URL || 'http://127.0.0.1:8880/upload',
        token: localStorage.getItem('token') || 'No token',
      });
      if (file.status === 'removed' && file.url) {
        try {
          const response = await fetch('/api/delete-file', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
            },
            body: JSON.stringify({ url: file.url }),
          });
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Не удалось удалить файл: ${response.status}`);
          }
          message.info(`${file.name} удалён`);
          setFileList(newFileList);
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          message.error(`Не удалось удалить файл: ${errorMsg}`);
          console.error('Delete error:', error);
        }
      } else {
        setFileList(newFileList);
        if (file.status === 'done') {
          const filePath = file.response?.url;
          if (filePath) {
            console.log('File saved at:', filePath);
            message.success(`${file.name} загружен успешно по пути: ${filePath}`);
          } else {
            message.error('Неверный ответ сервера: путь не возвращён');
            console.error('No URL in response:', file.response);
          }
        } else if (file.status === 'error') {
          const errorMessage =
            file.response?.message ||
            file.error?.message ||
            `Ошибка загрузки ${file.name}: Неизвестная ошибка`;
          message.error(errorMessage);
          console.error('Upload error details:', {
            file: {
              name: file.name,
              status: file.status,
              response: file.response,
              error: file.error,
            },
            action: process.env.NEXT_PUBLIC_UPLOAD_URL || 'http://127.0.0.1:8880/upload',
            token: localStorage.getItem('token') || 'No token',
          });
        }
      }
    },
    beforeUpload: file => {
      console.log('Before upload:', { name: file.name, size: file.size, type: file.type });
      const isValid = file.type.startsWith('image/') || file.type.startsWith('video/');
      if (!isValid) {
        message.error('Можно загружать только изображения или видео!');
        return Upload.LIST_IGNORE;
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('Файл должен быть меньше 10 МБ!');
        return Upload.LIST_IGNORE;
      }
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Токен авторизации отсутствует. Пожалуйста, войдите в систему.');
        return Upload.LIST_IGNORE;
      }
      return true;
    },
  };
  return (
    <App>
      <Modal
        title={post ? 'Редактировать пост' : 'Создать пост'}
        open={visible}
        onCancel={onCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            likes: 0,
            dislikes: 0,
            saved_count: 0,
          }}
        >
          <Form.Item
            label="Автор"
            name="author"
            rules={[{ required: true, message: 'Выберете издание' }]}
          >
            <Select
              placeholder="Издание"
              options={authors.map(author => ({
                value: author.id,
                label: author.name,
              }))}
            />
          </Form.Item>
          <Form.Item
            label="Название поста"
            name="title"
            rules={[{ required: true, message: 'Введите заголовок поста' }]}
          >
            <Input placeholder="Введите название поста" />
          </Form.Item>
          <Form.Item
            label="Текст поста"
            name="text"
            rules={[{ required: true, message: 'Введите текст поста' }]}
          >
            <Input.TextArea rows={4} placeholder="Введите текст поста" />
          </Form.Item>
          <Form.Item label="Медиа (изображения или видео)" name="media">
            <Upload {...uploadProps} listType="picture">
              <Button icon={<UploadOutlined />}>Загрузить</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            label="Лайки"
            name="likes"
            rules={[{ required: true, message: 'Введите кол-во лайков' }]}
          >
            <InputNumber min={0} placeholder="Кол-во лайков" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Дизлайки"
            name="dislikes"
            rules={[{ required: true, message: 'Введите кол-во дизлайков' }]}
          >
            <InputNumber min={0} placeholder="Кол-во дизлайков" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Сохранения"
            name="saved_count"
            rules={[{ required: true, message: 'Введите кол-во сохранений' }]}
          >
            <InputNumber min={0} placeholder="Кол-во сохранений" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <ConfigProvider
              theme={{
                components: {
                  Button: {
                    defaultHoverBorderColor: '#ffffff',
                    defaultHoverColor: '#ffffff',
                    defaultHoverBg: '#FB4724',
                  },
                },
              }}
            >
              <Button htmlType="submit" block>
                Опубликовать
              </Button>
            </ConfigProvider>
          </Form.Item>
        </Form>
      </Modal>
    </App>
  );
};

export default PostModal;
