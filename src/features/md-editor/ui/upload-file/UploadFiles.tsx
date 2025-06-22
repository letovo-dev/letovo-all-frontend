import React from 'react';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
import { Upload } from 'antd';
import type { GetProp, UploadFile, UploadProps } from 'antd';
import style from '../MdEditor.module.scss';

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

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
  setFileList: React.Dispatch<React.SetStateAction<UploadFile[] | undefined>>;
  fileList: UploadFile[] | undefined;
  token: string;
}) => {
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

        message.success(`File ${file.name} deleted successfully`);
      } catch (error: any) {
        message.error(`Failed to delete ${file.name}: ${error.message}`);
        return false;
      }
    }

    return true;
  };

  const props = {
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
