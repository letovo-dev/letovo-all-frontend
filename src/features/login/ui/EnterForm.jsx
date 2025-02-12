'use client';
import React, { useEffect, useState } from 'react';
import { ExclamationCircleOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, Card, Typography, ConfigProvider, Spin, Flex } from 'antd';
import { authStore } from '@/shared/stores/auth-store';
import { redirect } from 'next/navigation';
import style from './EnterForm.module.scss';

function EnterForm() {
  const { Title, Text } = Typography;
  const authed = authStore(state => state.userData.authed);
  const error = authStore(state => state.error);
  const user = localStorage.getItem('user');
  const userData = JSON.parse(user);
  const [form] = Form.useForm();
  const loading = authStore(state => state.loading);

  useEffect(() => {
    if (userData?.login && (authed || userData?.authed)) {
      redirect(`/user/${userData.login}`);
    }
  }, [authed, userData]);

  const [formData, setFormData] = useState({ login: undefined, password: undefined });

  const onFinish = async values => {
    authStore.getState().login(values);
  };

  const handleNameChange = e => {
    setFormData(prev => {
      return { ...prev, login: e.target.value };
    });
  };

  const handlePassChange = e => {
    setFormData(prev => {
      return { ...prev, password: e.target.value };
    });
  };

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
            {' '}
            <Spin size={'Large'} />
          </ConfigProvider>
        )}
      </div>
    );
  }

  return (
    <div className={style.loginFormWrapper}>
      <Title level={4}>ВХОД</Title>
      <Form
        name="form"
        // initialValues={
        //     action === 'login'
        //         ? { email: user.remember ? user.email : '', remember: user.remember }
        //         : { remember: true }
        // }
        // style={{ minWidth: '100%' }}
        onFinish={onFinish}
        form={form}
      >
        <Card
          style={{
            width: '332px',
            height: '186px',
            borderRadius: '7.35px',
            boxShadow: 'inset 0px 1.22px 0px 0px rgba(0, 0, 0, 0.25)',
            background: 'rgb(242, 242, 242)',
          }}
        >
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#FB4724',
                borderRadius: 20,
                colorBgContainer: 'rgba(5,5,5,0.06)',
              },
            }}
          >
            <Text className={style.inputTextHeader} type="secondary">
              {'Логин'}
            </Text>

            <Form.Item
              name="login"
              rules={[{ required: true, message: 'Введите логин' }]}
              className={style.formItem}
            >
              <Input
                onChange={handleNameChange}
                className={style.inputForm}
                prefix={<UserOutlined />}
                placeholder="Nickname"
              />
            </Form.Item>
            <Text className={style.inputTextHeader} type="secondary">
              {'Пароль'}
            </Text>
            <Form.Item
              className={style.formItemPass}
              name="password"
              rules={[{ required: true, message: 'Введите пароль' }]}
            >
              <Input
                className={style.inputForm}
                prefix={<LockOutlined />}
                type="password"
                placeholder="123abc"
                onChange={handlePassChange}
              />
            </Form.Item>
          </ConfigProvider>
          {error && (
            <Flex vertical={false} justify={'center'} align={'center'} gap="small">
              <ExclamationCircleOutlined style={{ color: '#FB4724' }} />
              <Text type="danger">{error}</Text>
            </Flex>
          )}
        </Card>
        <div className={style.buttonsContainer}>
          {/* <Button color="default" variant="link">
            забыли пароль */}
          <span className={style.forgetPass} onClick={() => console.log('забыли пароль')}>
            {' '}
            забыли пароль
          </span>
          {/* </Button> */}

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
              <Button
                htmlType="submit"
                disabled={!formData.login || !formData.password}
                className={style.submitButton}
              >
                Войти
              </Button>
            </ConfigProvider>

            {/* <Text type="secondary">
                            {action === 'login' ? 'Already have an account?' : "Don't have an account?"}
                        </Text>{' '}
                        {action === 'login' ? <NavLink to="/signup">Signup</NavLink> : <NavLink to="/">Login</NavLink>} */}
          </Form.Item>
        </div>
      </Form>
    </div>
  );
}

export default EnterForm;
