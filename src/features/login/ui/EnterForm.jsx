'use client';
import React, { useEffect, useState } from 'react';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, Card, Typography, ConfigProvider } from 'antd';
import { authStore } from '@/shared/stores/auth-store';
import { useApi } from '@/shared/hooks/useApi';
import { redirect } from 'next/navigation';
import style from './EnterForm.module.scss';

function EnterForm() {
  const { Title, Text } = Typography;
  const [formData, setFormData] = useState(undefined);
  const user = authStore.getState().userData;

  const authed = authStore(state => state.userData.authed);

  useEffect(() => {
    if (authed) {
      redirect('/');
    }
  }, [authed]);

  const { request } = useApi(authStore.getState().login, {
    payload: formData,
    requestOnInit: true,
    onmount: false,
    // messages: {
    //   success: 'Данные пользователей успешно загружены!',
    //   errorData: 'Не удалось загрузить данные пользователей.',
    //   errorRequest: 'Ошибка запроса. Проверьте соединение.',
    // },
    debugRequest: () => console.log('Запрос к API отправлен.'),
  });

  const onFinish = async values => {
    setFormData(values);
    await request(values);
  };

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Card>
        <div style={{ marginBottom: '10px' }}>
          <Title level={4}>
            <b>Welcome!</b>
          </Title>
          <Text type="secondary">{'Login to continue'}</Text>
        </div>
        <Form
          name="login"
          // initialValues={
          //     action === 'login'
          //         ? { email: user.remember ? user.email : '', remember: user.remember }
          //         : { remember: true }
          // }
          style={{ minWidth: '100%' }}
          onFinish={onFinish}
        >
          {/* <ConfigProvider
            theme={{
              token: {
                // Seed Token
                colorPrimary: '#ffa39e',
                borderRadius: 20,

                // Alias Token
                colorBgContainer: 'rgba(5,5,5,0.06)',
              },
            }}
          > */}
          <Form.Item name="login" rules={[{ required: true, message: 'Please input your login!' }]}>
            <Input className={style.inputForm} prefix={<UserOutlined />} placeholder="Kotya" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input
              className={style.inputForm}
              prefix={<LockOutlined />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>
          {/* </ConfigProvider> */}

          {/* <div>
                        <Form.Item
                            name="remember"
                            valuePropName="checked"
                            style={{ visibility: 'visible', marginBottom: 10 }}
                        >
                            <Checkbox style={{ visibility: 'visible' }}>
                                <Text type="secondary">Remember me</Text>
                            </Checkbox>
                        </Form.Item>
                        {action === 'login' ? (
                            <div style={{ marginBottom: 10 }}>
                                <a href="">Forgot password</a>
                            </div>
                        ) : null}
                    </div> */}

          <Form.Item>
            <Button block type="primary" htmlType="submit" style={{ marginBottom: '10px' }}>
              Login
            </Button>
            {/* <Text type="secondary">
                            {action === 'login' ? 'Already have an account?' : "Don't have an account?"}
                        </Text>{' '}
                        {action === 'login' ? <NavLink to="/signup">Signup</NavLink> : <NavLink to="/">Login</NavLink>} */}
          </Form.Item>
        </Form>
        {/* {error && <Text type="danger">{error}</Text>} */}
      </Card>
      {/* </Spin> */}
    </div>
  );
}

export default EnterForm;
