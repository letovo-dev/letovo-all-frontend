'use client';
import React, { useState } from 'react';
import { LoadingOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, Card, Typography, Spin } from 'antd';
import { authStore } from '@/shared/stores/auth-store';
import { useApi2 } from '@/shared/hooks/useApi';
import { AuthService } from '@/shared/api/authService';

function EnterForm() {
  const { Title, Text } = Typography;
  const [formData, setFormData] = useState(undefined);

  // const onFinish = values => {
  //   setFormData(values);
  //   const { login, password } = values;

  // authStore.getState().login(values);
  // };
  // const { login: authenticate, loading, error } = useAuth();

  // const onFinish = async values => {
  //   const { login, password } = values;
  //   await authenticate(login, password);

  // };
  const { request } = useApi2(authStore.getState().login, {
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
    // authStore.getState().login(values);
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
          <Form.Item name="login" rules={[{ required: true, message: 'Please input your login!' }]}>
            <Input prefix={<UserOutlined />} placeholder="Kotya" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input prefix={<LockOutlined />} type="password" placeholder="Password" />
          </Form.Item>
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
