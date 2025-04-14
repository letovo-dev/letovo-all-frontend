import React from 'react';
import { Button, ConfigProvider, Form, Spin } from 'antd';
import style from './SideBarNewsContent.module.scss';
import { SearchOutlined } from '@ant-design/icons';

const SideBarNewsContent = ({ loading, formData = {}, form, handleNameInput, onFinish }: any) => {
  return (
    <Form name="form" onFinish={onFinish} form={form}>
      {loading && (
        <div className={style.spinWrapper}>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#FB4724',
              },
            }}
          >
            <Spin size={'large'} />
          </ConfigProvider>
        </div>
      )}
      <div className={style.inputForm}>
        <Form.Item name="search_query" initialValue={formData.search_query}>
          <input
            type="text"
            className={style.customInput}
            placeholder="Введите текст для поиска"
            autoComplete="text"
            onChange={handleNameInput}
            value={formData.search_query || ''}
          />
        </Form.Item>
        <Form.Item className={style.searchButtonItem}>
          <Button htmlType="submit" disabled={false} type="link">
            <SearchOutlined style={{ fontSize: 18, color: ' rgba(0, 0, 0, 0.5)' }} />
          </Button>
        </Form.Item>
      </div>
    </Form>
  );
};

export default SideBarNewsContent;
