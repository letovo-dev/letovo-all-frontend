import React from 'react';
import { ConfigProvider, Select } from 'antd';
import styles from './CustomSelect.module.scss';
import {
  BaiduOutlined,
  DockerOutlined,
  InsuranceOutlined,
  MessageOutlined,
} from '@ant-design/icons';

const CustomSelect = ({ value, onChange }) => {
  const handleChange = value => {
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorBorder: 'none',
        },
        components: {
          Select: {
            optionHeight: 46,
            optionPadding: '10px 12px',
            // activeBorderColor: '#f0f0f0',
            // hoverBorderColor: '#f0f0f0',
            // multipleItemColorDisabled: '#f0f0f0',
            // activeOutlineColor: '#f0f0f0',
            // multipleItemBg: '#f0f0f0',
            // multipleSelectorBgDisabled: '#f0f0f0',
            // optionActiveBg: '#f0f0f0',
            // optionSelectedColor: '#f0f0f0',
          },
        },
      }}
    >
      <Select
        style={{ width: '60px' }}
        defaultValue={'option1'}
        value={value}
        onChange={handleChange}
        suffixIcon={null}
        maxTagCount={3}
        listHeight={100}
        dropdownStyle={{ width: '60px', border: 'none' }}
      >
        <Select.Option value="option1">
          <BaiduOutlined style={{ fontSize: '20px' }} />
        </Select.Option>
        <Select.Option value="option2">
          <DockerOutlined style={{ fontSize: '20px' }} />
        </Select.Option>
        <Select.Option value="option3">
          <InsuranceOutlined style={{ fontSize: '20px' }} />
        </Select.Option>
        <Select.Option value="option4">
          <MessageOutlined style={{ fontSize: '20px' }} />
        </Select.Option>
      </Select>
    </ConfigProvider>
  );
};

export default CustomSelect;
