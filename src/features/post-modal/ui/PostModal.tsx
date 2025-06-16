'use client';

import React, { useEffect } from 'react';
import {
  Modal,
  Form,
  Select,
  Input,
  Upload,
  Button,
  InputNumber,
  message,
  ConfigProvider,
} from 'antd';
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

  //   console.log('post', post);

  // Reset form and file list when modal opens or post changes
  useEffect(() => {
    if (visible) {
      if (post) {
        // Edit mode: populate form with post data
        form.setFieldsValue({
          author: post.author,
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
        // Create mode: reset form
        form.resetFields();
        setFileList([]);
      }
    }
  }, [visible, post, form]);

  const handleSubmit = async (values: any) => {
    try {
      const formData = {
        ...values,
        mediaUrl: fileList.map(file => file.url || file.response?.url).filter(Boolean), // Все URL из fileList
      };
      await onSubmit(formData);
      message.success(post ? 'Пост успешно изменен' : 'Пост успешно сохранен');
      onCancel(); // Close modal on success
    } catch (error) {
      message.error('Не удалось сохранить пост');
      console.error('Submit error:', error);
    }
  };

  const uploadProps: UploadProps = {
    name: 'file',
    accept: 'image/*,video/*', // Accept images and videos
    fileList,
    onChange: async ({ file, fileList: newFileList }) => {
      if (file.status === 'removed' && file.url) {
        try {
          // Отправляем запрос на сервер для удаления файла
          const response = await fetch('/api/delete-file', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: file.url }),
          });
          if (!response.ok) {
            throw new Error('Ошибка удаления файла');
          }
          message.info(`${file.name} удалён`);
          setFileList(newFileList); // Обновляем fileList после успешного удаления
        } catch (error) {
          message.error('Не удалось удалить файл с сервера');
          console.error('Delete error:', error);
          // Не обновляем fileList при ошибке
        }
      } else {
        setFileList(newFileList); // Обновляем fileList для других случаев
        if (file.status === 'done') {
          message.success(`${file.name} загружен успешно`);
        } else if (file.status === 'error') {
          message.error('Ошибка загрузки');
          console.error('Upload error:', file.error);
        }
      }
    },
    beforeUpload: file => {
      const isValid = file.type.startsWith('image/') || file.type.startsWith('video/');
      if (!isValid) {
        message.error('You can only upload image or video files!');
      }
      const isLt10M = file.size / 1024 / 1024 < 10; // Limit to 10MB
      if (!isLt10M) {
        message.error('File must be smaller than 10MB!');
      }
      return isValid && isLt10M ? true : Upload.LIST_IGNORE;
    },
    // Mock API endpoint (replace with your actual upload endpoint)
    action: '/api/upload', // Example: replace with your server endpoint
  };

  return (
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
          label="Текст поста"
          name="text"
          rules={[{ required: true, message: 'Введите текст поста' }]}
        >
          <Input.TextArea rows={4} placeholder="Текст поста" />
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
  );
};

export default PostModal;
