import React from 'react';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
import { Upload } from 'antd';
import type { GetProp, UploadFile, UploadProps } from 'antd';
import style from '../MdEditor.module.scss';

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

interface CustomUploadFile extends UploadFile {
  response?: string | { file: string };
}

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error: any) => reject(error);
  });

const UploadFiles = ({
  setFileList,
  fileList,
  token,
}: {
  setFileList: React.Dispatch<React.SetStateAction<CustomUploadFile[] | undefined>>;
  fileList: CustomUploadFile[] | undefined;
  token: string;
}) => {
  const handleChange: UploadProps['onChange'] = ({ file, fileList: newFileList }) => {
    const transformedFileList = newFileList.map(item => {
      if (item.response && typeof item.response === 'object' && 'file' in item.response) {
        return {
          ...item,
          response: item.response.file,
        };
      }
      return item;
    });

    setFileList(transformedFileList);

    if (file.status === 'error') {
      console.error('Upload failed:', file.error);
      message.error(`Не удалось загрузить ${file.name}`);
    } else if (file.status === 'done') {
      message.success(`Файл ${file.name} успешно загружен`);
    }
  };

  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  const handleRemove = async (file: CustomUploadFile) => {
    if (file.url) {
      try {
        const response = await fetch(`YOUR_SERVER_URL/delete/${file.uid}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token || ''}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete file on server');
        }

        message.success(`Файл ${file.name} успешно удалён`);
      } catch (error: any) {
        message.error(`Не удалось удалить ${file.name}: ${error.message}`);
        return false;
      }
    }

    return true;
  };

  const props: UploadProps = {
    name: 'file',
    accept: 'image/*,video/*,pdf/*',
    fileList,
    action: `${process.env.NEXT_PUBLIC_BASE_URL_UPLOAD}`,
    onChange: handleChange,
    onRemove: handleRemove,
    multiple: false,
    headers: {
      Authorization: `Bearer ${token || ''}`,
    },
  };

  return (
    <div className={style.upload}>
      <Upload {...props} maxCount={1}>
        <Button icon={<UploadOutlined />}>Загрузить файл</Button>
      </Upload>
    </div>
  );
};

export default UploadFiles;
