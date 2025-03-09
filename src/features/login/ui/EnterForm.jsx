'use client';
import React, { useEffect, useState } from 'react';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Form, Typography, ConfigProvider, Spin, Flex } from 'antd';
import authStore from '@/shared/stores/auth-store';
import { redirect } from 'next/navigation';
import style from './EnterForm.module.scss';
import { setDataToLocaleStorage } from '@/shared/lib/ApiSPA/axios/helpers';
import userStore from '@/shared/stores/user-store';
import CustomModal from './CustomForgetPassModal';

function EnterForm() {
  const { Title, Text } = Typography;
  const userStatus = authStore(state => state.userStatus);
  const userName = userStore(state => state.store?.userData.username);
  const error = authStore(state => state.error);
  const [form] = Form.useForm();
  const loading = authStore(state => state.loading);
  const [formData, setFormData] = useState({ login: '', password: '' });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // redirect('./registration');

    if (userStatus?.logged && userStatus?.registered) {
      setDataToLocaleStorage('token', userStatus?.token);
      redirect(`/user/${userName}`);
    }
    if (userStatus?.logged && !userStatus?.registered) {
      console.log(
        'userStatus?.logged && !userStatus?.registered',
        userStatus?.logged && !userStatus?.registered,
      );

      setDataToLocaleStorage('token', userStatus?.token);
      redirect('./registration');
    }
  }, [userStatus]);

  const onFinish = values => {
    authStore.getState().login(values);
  };

  const handleNameInput = e => {
    setFormData(prev => {
      return { ...prev, login: e.target.value || '' };
    });
  };

  const handlePassInput = e => {
    setFormData(prev => {
      return { ...prev, password: e.target.value || '' };
    });
  };

  const showModal = () => {
    setOpen(true);
  };

  console.log('error', error);

  const disabledButton = !formData?.login || !formData?.password;

  if (loading) {
    return (
      <div className={style.loginFormWrapper}>
        {loading && (
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#FB4724',
              },
            }}
          >
            <Spin size={'large'} />
          </ConfigProvider>
        )}
      </div>
    );
  }

  return (
    <div className={style.loginFormWrapper}>
      <div className={style.titleBorder}>
        <Title level={4}>ВХОД</Title>
      </div>
      <Form name="form" onFinish={onFinish} form={form}>
        <div className={style.card}>
          <div style={{ width: '90%' }}>
            <Text className={style.inputTextHeader} type="secondary">
              {'Логин'}
            </Text>
            <Form.Item
              name="login"
              initialValue={formData.login}
              className={!error ? style.inputForm : style.inputFormError}
            >
              <input
                type="text"
                className={style.customInput}
                placeholder="Nickname"
                autoComplete="username"
                onChange={handleNameInput}
                value={formData.login || ''}
              />
            </Form.Item>
            <Text className={style.inputTextHeader} type="secondary">
              {'Пароль'}
            </Text>
            <Form.Item
              className={!error ? style.inputForm : style.inputFormError}
              name="password"
              initialValue={formData.password}
            >
              <input
                className={style.customInput}
                type="password"
                id="form_password"
                onChange={handlePassInput}
                autoComplete="current-password"
                placeholder="Password"
                value={formData.password || ''}
              />
            </Form.Item>

            {error && (
              <Flex vertical={false} justify={'center'} align={'center'} gap="small">
                <ExclamationCircleOutlined style={{ color: '#FB4724' }} />
                <Text type="danger">{error}</Text>
              </Flex>
            )}
          </div>
        </div>
        <div className={style.buttonsContainer}>
          <span className={style.forgetPass} onClick={() => showModal()}>
            забыли пароль
          </span>
          <Form.Item>
            <ConfigProvider
              theme={{
                components: {
                  Button: {
                    defaultHoverBorderColor: disabledButton ? '' : '#ffffff',
                    defaultHoverColor: disabledButton ? '' : '#ffffff',
                    defaultHoverBg: disabledButton ? '' : '#FB4724',
                  },
                },
              }}
            >
              <Button htmlType="submit" disabled={disabledButton} className={style.submitButton}>
                Войти
              </Button>
            </ConfigProvider>
          </Form.Item>
        </div>
      </Form>
      {open && <CustomModal open={open} setOpen={setOpen} title="Забыли пароль?" />}
    </div>
  );
}

export default EnterForm;
