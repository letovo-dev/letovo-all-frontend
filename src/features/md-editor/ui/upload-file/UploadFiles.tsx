import React, { useState } from 'react';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
import { Image, Upload } from 'antd';
import type { GetProp, UploadFile, UploadProps } from 'antd';

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error: any) => reject(error);
  });

const UploadFiles: React.FC = () => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleChange: UploadProps['onChange'] = ({ file, fileList: newFileList }) => {
    setFileList(newFileList);
    if (file.status === 'error') {
      console.error('Upload failed:', file.error);
    }
  };
  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  const handleRemove = async (file: UploadFile) => {
    // Если файл был загружен на сервер, отправляем запрос на удаление
    if (file.url) {
      try {
        const response = await fetch(`YOUR_SERVER_URL/delete/${file.uid}`, {
          method: 'DELETE',
          headers: {
            // Добавьте заголовки, если нужны (например, авторизация)
            // 'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete file on server');
        }

        message.success(`File ${file.name} deleted successfully`);
      } catch (error: any) {
        message.error(`Failed to delete ${file.name}: ${error.message}`);
        return false; // Отменяем удаление из fileList, если сервер вернул ошибку
      }
    }

    // Разрешаем удаление из fileList
    return true;
  };

  const props = {
    action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',
    onChange: handleChange,
    onRemove: handleRemove,
    multiple: true,
  };

  return (
    <>
      <Upload fileList={fileList} {...props}>
        <Button icon={<UploadOutlined />}>Upload</Button>
      </Upload>
    </>
  );
};

export default UploadFiles;
