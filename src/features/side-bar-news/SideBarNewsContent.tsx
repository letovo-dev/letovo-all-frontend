import React from 'react';
import { Button, Form, FormInstance } from 'antd';
import style from './SideBarNewsContent.module.scss';
import { SearchOutlined } from '@ant-design/icons';
import Image from 'next/image';

interface SideBarNewsContentProps {
  loading: boolean;
  form: FormInstance;
  onFinish: (values: { search_query: string }) => Promise<void>;
}

const SideBarNewsContent: React.FC<SideBarNewsContentProps> = ({ loading, form, onFinish }) => {
  return (
    <Form form={form} name="form" onFinish={onFinish} initialValues={{ search_query: '' }}>
      <div className={style.inputForm}>
        <Form.Item name="search_query">
          <input
            type="text"
            className={style.customInput}
            placeholder="поиск"
            autoComplete="text"
            onChange={e => form.setFieldsValue({ search_query: e.target.value })}
            value={form.getFieldValue('search_query') || ''}
            disabled={loading}
          />
        </Form.Item>
        <Form.Item className={style.searchButtonItem}>
          <Button htmlType="submit" disabled={false} type="link">
            <Image src="/26_search.svg" alt="search" height={20} width={20} />
          </Button>
        </Form.Item>
      </div>
    </Form>
  );
};

export default SideBarNewsContent;
