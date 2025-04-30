import React from 'react';
import style from './Spin.module.scss';
import { ConfigProvider, Spin } from 'antd';

const SpinModule: React.FC = () => {
  return (
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
  );
};

export default SpinModule;
